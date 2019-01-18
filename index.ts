import React from 'react';
import { createProvider, RLProviderProps } from './create-provider';

type $PartialMap<S extends {}> = {
    [P in keyof S]?: S[P];
};
type $ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;

export type RLSetState<S extends {}> = (state: $PartialMap<S> | RLThunk<S>) => void;
export type RLGetState<S extends {}> = () => S;
export type RLThunk<S extends {}, R = any> = (getState: RLGetState<S>, setState: RLSetState<S>) => R;
export type RLActions<S> = {
    [actionName: string]: (...args: any[]) =>
        ((getState: RLGetState<S>, setState: RLSetState<S>) => any)
        | $PartialMap<S>,
};

type RLStore<S, Actions> = {
    Provider: React.ComponentClass<RLProviderProps<S>, S>,
    Consumer: React.Consumer<S>,
    getState?: RLGetState<S>,
    actions: Actions,
};

type WrappedAction<S extends {}, F extends Function> =
    F extends (...args: infer Args) => (getState: RLGetState<S>, setState: RLSetState<S>) => infer R
        ? (...args: Args) => R
        : F extends (...args: infer Args) => $PartialMap<S>
            ? (...args: Args) => $PartialMap<S>
            : never;

export function createStore<
    S extends object,
    A extends RLActions<S>,
    WrappedActions extends {
        [K in keyof A]: WrappedAction<S, A[K]>
    }
>(
    initialState: S,
    actions: A,
): RLStore<S, WrappedActions> {
    let getState: RLGetState<S> | undefined;
    let setState: RLSetState<S> | undefined;

    const Context = React.createContext(initialState);
    const Provider = createProvider(
        (providerGetState, providerSetState) => {
            getState = providerGetState;
            setState = (state: $PartialMap<S> | RLThunk<S>) => {
                if (typeof state === 'function') {
                    return state(providerGetState, providerSetState);
                } else {
                    providerSetState(state);
                }
            };
        },
        Context.Provider,
        initialState,
    );

    const wrappedActions: WrappedActions = {} as WrappedActions;

    Object.keys(actions)
        .forEach(key => {
            const originalFn = actions[key];
            const wrappedFn: any = (...args: $ArgumentTypes<typeof originalFn>) => {
                const result = originalFn(...args);

                if (!getState || !setState) {
                    // tslint:disable-next-line:no-console
                    console.error('<Provider /> is not initialized');

                    return;
                }

                if (typeof result === 'function') {
                    return result(getState, setState);
                } else {
                    setState(result);

                    return;
                }
            };

            wrappedActions[key] = wrappedFn;
        });

    return {
        Provider,
        Consumer: Context.Consumer,
        actions: wrappedActions,
        getState,
    };
}
