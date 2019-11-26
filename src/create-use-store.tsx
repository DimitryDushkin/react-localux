import React, {
  createContext,
  FC,
  useContext,
  useRef,
  useEffect,
  useMemo,
  useReducer,
  useCallback
} from "react";
import {
  ActionsUnion,
  MethodsIn,
  MethodsOut,
  EffectsIn,
  EffectsOut
} from "./types";
import { createStubMethods, keysOf, createStubEffects } from "./utils";
import { tryCreateDevToolsLogger } from "./devtools";

export function useLocalux<
  S extends any,
  M extends MethodsIn<S>,
  E extends EffectsIn<MethodsOut<M>, S>
>(initialState: S, methods: M, effectsIn: E = {} as E) {
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

    return (state: S, action: ActionsUnion<M>) => {
      const nextState = methods[action.type](state)(...action.payload);
      if (logger) {
        logger(action, nextState);
      }

      return nextState;
    };
  }, []);

  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(initialState);
  const getState = useCallback(() => stateRef.current, []);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const methodsOut = useMemo(
    () =>
      keysOf(methods).reduce((methodsOutAcc, type) => {
        methodsOutAcc[type] = (...payload) => {
          // Do not dispatch actions on unmounted Provider
          if (!isMounted.current) {
            console.warn(
              "Method called on unmounted Provider, but it can be ok."
            );
            return;
          }

          dispatch({
            type,
            payload
          } as ActionsUnion<M>);
        };

        return methodsOutAcc;
      }, {} as MethodsOut<M>),
    []
  );

  const effectsOut = useMemo(() => {
    return keysOf(effectsIn).reduce((effectsOutAcc, effectFnName) => {
      effectsOutAcc[effectFnName] = (...args) => {
        return effectsIn[effectFnName](getState, methodsOut)(...args);
      };

      return effectsOutAcc;
    }, {} as EffectsOut<E, MethodsOut<M>, S>);
  }, [methodsOut]);

  return [state, methodsOut, effectsOut] as const;
}

export const createUseStore = <
  S extends any,
  MIn extends MethodsIn<S>,
  E extends EffectsIn<MethodsOut<MethodsIn<S>>, S>
>(
  defaultState: S,
  methodsIn: MIn,
  effectsIn: E
) => {
  const methodsStubsWithoutProvider = createStubMethods(methodsIn);
  const effectsStubsWithoutProvider = createStubEffects(effectsIn);

  const context = createContext([
    defaultState,
    methodsStubsWithoutProvider,
    effectsStubsWithoutProvider
  ] as const);

  const StoreProvider: FC<{ initialState: S }> = ({
    initialState,
    children
  }) => {
    const [state, methods, effects] = useLocalux(
      initialState,
      methodsIn,
      effectsIn
    );
    return (
      <context.Provider value={[state, methods, effects]}>
        {children}
      </context.Provider>
    );
  };

  const useStore = () => {
    const [state, methods, effects] = useContext(context);
    return { state, methods, effects };
  };

  useStore.Provider = StoreProvider;

  return useStore;
};
