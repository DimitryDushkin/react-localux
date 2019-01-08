import React from 'react';
import { createProvider, RVSProviderProps } from './create-provider';

type $PartialMap<S extends {}> = {
    [P in keyof S]?: S[P];
};
type $ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;
export type RVSetState<S extends {}> = (
    state: $PartialMap<S> | RVSThunk<S>,
) => void;

export type RVGetState<S extends {}> = () => S;

export type RVSThunk<S extends {}, R = any> = (getState: RVGetState<S>, setState: RVSetState<S>) => R;
export type RVSStore<S, RVSActions> = {
    Provider: React.ComponentClass<RVSProviderProps<S>, S>,
    Consumer: React.Consumer<S>,
    actions: RVSActions,
};
export type RVActions<S> = {
    [actionName: string]: (...args: any[]) =>
        ((getState: RVGetState<S>, setState: RVSetState<S>) => any)
        | $PartialMap<S>,
};

type RVWrappedAction<S extends {}, F extends Function> =
    F extends (...args: infer Args) => (getState: RVGetState<S>, setState: RVSetState<S>) => infer R
        ? (...args: Args) => R
        : F extends (...args: infer Args) => $PartialMap<S>
            ? (...args: Args) => $PartialMap<S>
            : never;

export function createStore<
    S extends object,
    A extends RVActions<S>,
    RVWrappedActions extends {
        [K in keyof A]: RVWrappedAction<S, A[K]>
    }
>(
    initialState: S,
    actions: A,
): RVSStore<S, RVWrappedActions> {
    let getState: RVGetState<S> | undefined;
    let setState: RVSetState<S> | undefined;

    const Context = React.createContext(initialState);
    const Provider = createProvider(
        (providerGetState, providerSetState) => {
            getState = providerGetState;
            setState = (state: $PartialMap<S> | RVSThunk<S>) => {
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

    const wrappedActions: RVWrappedActions = {} as RVWrappedActions;

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
    };
}
