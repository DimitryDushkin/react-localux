import { MethodsIn, MethodsOut, EffectsIn, EffectsOut } from "./types";

export class NoProviderError extends Error {}

export const createStubMethods = <M extends MethodsIn>(methodsIn: M) =>
  keysOf(methodsIn).reduce((methods, type) => {
    methods[type] = () => {
      throw new NoProviderError(
        "Store method called without top-level Provider"
      );
    };
    return methods;
  }, {} as MethodsOut<M>);

export const createStubEffects = <
  E extends EffectsIn<MethodsOut<M>>,
  M extends MethodsIn
>(
  effectsIn: E
) =>
  keysOf(effectsIn).reduce((effects, type) => {
    effects[type] = () => {
      throw new NoProviderError(
        "Store effect called without top-level Provider"
      );
    };
    return effects;
  }, {} as EffectsOut<E, MethodsOut<M>>);

export const keysOf = <T extends Record<string, any>>(obj: T) =>
  Object.keys(obj) as (keyof T)[];
