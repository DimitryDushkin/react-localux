import createUseContext from 'constate';
import { useEffect, useMemo, useReducer, useRef } from 'react';

import { tryCreateDevToolsLogger } from './devtools';

type MethodIn<S> = (state: S) => (...args: any[]) => S;
type MethodsIn<S = any> = Record<string, MethodIn<S>>;
type MethodOutArgs<S, F> = F extends (state: S) => (...args: infer Args) => S
  ? Args
  : never;
type MethodOut<S, F> = (...args: MethodOutArgs<S, F>) => void;
type MethodsOut<S, M extends MethodsIn<S>> = {
  [K in keyof M]: MethodOut<S, M[K]>
};
export type Thunk<M extends MethodsIn<any>> = (
  methods: MethodsOut<any, M>
) => (...args: any[]) => any;

export type ActionsUnion<S, M extends MethodsIn> = {
  [K in keyof M]: { type: K; payload: MethodOutArgs<S, M[K]> }
}[keyof M];

export function useMethods<S extends any, M extends MethodsIn<S>>(
  initialState: S,
  methods: M
) {
  // To avoid warnings "Can't perform a React state update on an unmounted component"
  const isMounted = useRef(true);
  useEffect(
    () => () => {
      isMounted.current = false;
    },
    []
  );

  const reducer = useMemo(() => {
    const logger = tryCreateDevToolsLogger();

    return (state: S, action: ActionsUnion<S, M>) => {
      const nextState = methods[action.type](state)(...action.payload);
      if (logger) {
        logger(action, nextState);
      }

      return nextState;
    };
  }, []);

  const [state, dispatch] = useReducer(reducer, initialState);
  const methodsOut = useMemo(() => {
    const methodsOut = {} as MethodsOut<S, M>;

    Object.keys(methods).forEach(type => {
      methodsOut[type] = (...payload) => {
        if (!isMounted.current) {
          return;
        }

        dispatch({
          type,
          payload
        } as ActionsUnion<S, M>);
      };
    });

    return methodsOut;
  }, []);

  return { state, methods: methodsOut };
}

export const createUseStore = <S extends any, M extends MethodsIn<S>>(
  defaultState: S,
  methodsIn: M
) =>
  createUseContext(
    ({ initialState }: { initialState: S }) =>
      useMethods(initialState || defaultState, methodsIn),
    // https://kentcdodds.com/blog/always-use-memo-your-context-value
    // Pass to context not a new object every time
    ({ state }) => [state]
  );
