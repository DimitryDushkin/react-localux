import { useReducer, useMemo } from "react";
import createUseContext from "constate";
import { tryCreateDevToolsLogger } from "./devtools";

type MethodArgs<S, F extends MethodIn<S>> = F extends (
  state: S
) => (...args: infer Args) => any
  ? Args
  : never;

type MethodIn<S> = (state: S) => (...args: any[]) => S;
type MethodsIn<S> = Record<string, MethodIn<S>>;
type MethodOut<S, F> = F extends (state: S) => (...args: infer Args) => S
  ? (...args: Args) => void
  : never;
type MethodsOut<S, M extends MethodsIn<S>> = {
  [K in keyof M]: MethodOut<S, M[K]>
};
export type Thunk<M extends MethodsIn<any>> = (
  methods: MethodsOut<any, M>
) => (...args: any[]) => any;

type Action<P> = {
  type: string;
  payload: P;
};

export function useMethods<S extends any, M extends MethodsIn<S>>(
  initialState: S,
  methods: M
) {
  // 1. Create actions and action creators from map of actions
  const reducer = useMemo(() => {
    const logger = tryCreateDevToolsLogger();

    return (state: S, action: Action<any>) => {
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
      const originalMethodIn = methods[type];
      const methodOut: MethodOut<S, typeof originalMethodIn> = (
        ...payload: MethodArgs<S, typeof originalMethodIn>
      ) => {
        dispatch({
          type: type,
          payload
        });
      };

      // @ts-ignore
      methodsOut[type] = methodOut;
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
