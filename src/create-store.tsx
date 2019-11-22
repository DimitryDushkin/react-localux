import React, {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  createContext,
  FC,
  useContext
} from "react";
import { tryCreateDevToolsLogger } from "./devtools";

type MethodIn<S> = (state: S) => (...args: any[]) => S;
type MethodsIn<S = any> = Record<string, MethodIn<S>>;
type MethodOutArgs<S, F> = F extends (state: S) => (...args: infer Args) => S
  ? Args
  : never;
type MethodOut<S, F> = (...args: MethodOutArgs<S, F>) => void;
type MethodsOut<S, M extends MethodsIn<S>> = {
  [K in keyof M]: MethodOut<S, M[K]>;
};

export type Thunk<M extends MethodsIn<any>> = (
  methods: MethodsOut<any, M>
) => (...args: any[]) => any;

export type ActionsUnion<S, M extends MethodsIn> = {
  [K in keyof M]: { type: K; payload: MethodOutArgs<S, M[K]> };
}[keyof M];

const keysOf = <T extends Record<string, any>>(obj: T) =>
  Object.keys(obj) as (keyof T)[];

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

    keysOf(methods).forEach(type => {
      methodsOut[type] = (...payload) => {
        // Do not dispatch actions on unmounted Provider
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

  return [state, methodsOut] as const;
}

export class NoProviderError extends Error {}

const createStubMethods = <S extends any, M extends MethodsIn<S>>(
  methodsIn: M
) =>
  keysOf(methodsIn).reduce((methods, type) => {
    methods[type] = () => {
      throw new NoProviderError(
        "Store method called without top-level Provider"
      );
    };
    return methods;
  }, {} as MethodsOut<S, M>);

export const createUseStore = <S extends any, M extends MethodsIn<S>>(
  defaultState: S,
  methodsIn: M
) => {
  const methodsStubsWithoutProvider = createStubMethods(methodsIn);

  const context = createContext([
    defaultState,
    methodsStubsWithoutProvider
  ] as const);

  const StoreProvider: FC<{ initialState: S }> = ({
    initialState,
    children
  }) => {
    const [state, methods] = useMethods(initialState, methodsIn);
    return (
      <context.Provider value={[state, methods]}>{children}</context.Provider>
    );
  };

  const useStore = () => {
    const [state, methods] = useContext(context);
    return { state, methods };
  };

  useStore.Provider = StoreProvider;

  return useStore;
};
