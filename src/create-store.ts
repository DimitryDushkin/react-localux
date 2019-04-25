import React from 'react';
import { createProvider, RLProviderProps } from './create-provider';
import { createDevToolsLogger } from './devtools';

type $PartialMap<S extends {}> = {
    [P in keyof S]?: S[P];
};
type $ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;

export type RLSetState<S extends {}, R = any, E = undefined> = (state: $PartialMap<S> | RLThunk<S, R, E>) => void;
export type RLGetState<S extends {}> = () => S;
export type RLThunk<S extends {}, R = any, E = undefined> = (getState: RLGetState<S>, setState: RLSetState<S, R, E>, extraArgument: E) => R;
export type RLActions<S, E> = {
    [actionName: string]: (...args: any[]) =>
        ((getState: RLGetState<S>, setState: RLSetState<S, any, E>, extraArgument: E) => any)
        | $PartialMap<S>,
};

type RLStore<S, Actions> = {
    Context: React.Context<S>,
    Provider: React.ComponentClass<RLProviderProps<S>, S>,
    Consumer: React.Consumer<S>,
    getState: RLGetState<S>,
    actions: Actions,
};

type WrappedAction<S extends {}, F extends Function, E> =
    F extends (...args: infer Args) => (getState: RLGetState<S>, setState: RLSetState<S, any, E>, extraArgument: E) => infer R
        ? (...args: Args) => R
        : F extends (...args: infer Args) => $PartialMap<S>
            ? (...args: Args) => $PartialMap<S>
            : never;

export function createStore<
    S extends object,
    A extends RLActions<S, E>,
    WrappedActions extends {
        [K in keyof A]: WrappedAction<S, A[K], E>
    },
    E = undefined,
>(
        initialState: S,
        actions: A,
        extraArgument: E,
): RLStore<S, WrappedActions> {
    let getState: RLGetState<S> | undefined;
    let setState: RLSetState<S, any, E> | undefined;

    const Context = React.createContext(initialState);
    const Provider = createProvider<S, E>(
        (providerGetState, providerSetState) => {
            getState = providerGetState;
            setState = (state: $PartialMap<S> | RLThunk<S, any, E>) => {
                if (typeof state === 'function') {
                    return state(providerGetState, providerSetState, extraArgument);
                } else {
                    devToolsLogger && devToolsLogger('state update', state);
                    providerSetState(state);
                }
            };
        },
        Context.Provider,
        initialState,
    );
    const devToolsLogger = typeof window !== 'undefined' &&
        window.__REDUX_DEVTOOLS_EXTENSION__
            ? createDevToolsLogger()
            : undefined;

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
                    devToolsLogger && devToolsLogger(`thunk — ${key}`, getState());
                    return result(getState, setState, extraArgument);
                } else {
                    // Never-ever goes here
                    devToolsLogger && devToolsLogger(key, result);
                    setState(result);

                    return;
                }
            };

            wrappedActions[key] = wrappedFn;
        });

    return {
        Context,
        Provider,
        Consumer: Context.Consumer,
        actions: wrappedActions,
        getState: () => getState ? getState() : initialState,
    };
}
