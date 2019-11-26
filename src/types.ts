export type MethodIn<S = any> = (state: S) => (...args: any[]) => S;
export type MethodsIn<S = any> = Record<string, MethodIn<S>>;
export type ExtractMethodInArgs<F> = F extends (
  state: any
) => (...args: infer Args) => any
  ? Args
  : never;
export type MethodOut<F> = (...args: ExtractMethodInArgs<F>) => void;
export type MethodsOut<M extends MethodsIn> = {
  [K in keyof M]: MethodOut<M[K]>;
};

export type ActionsUnion<M extends MethodsIn> = {
  [K in keyof M]: { type: K; payload: ExtractMethodInArgs<M[K]> };
}[keyof M];

export type ExtractStateFromMethodsOut<M> = M extends MethodsOut<
  MethodsIn<infer S>
>
  ? S
  : unknown;
export type ExtractEffectInArgs<F> = F extends (
  getState: () => any,
  methods: any
) => (...args: infer Args) => any
  ? Args
  : never;

export type ExtractEffectInResult<F> = F extends (
  getState: () => any,
  methods: any
) => (...args: any) => infer Result
  ? Result
  : never;

export type EffectIn<MOut extends MethodsOut<MethodsIn>, S = any> = (
  getState: () => S,
  methods: MOut
) => (...args: any[]) => any;

export type EffectsIn<MOut extends MethodsOut<MethodsIn<S>>, S = any> = Record<
  string,
  EffectIn<MOut, S>
>;

export type EffectOut<F> = (
  ...args: ExtractEffectInArgs<F>
) => ExtractEffectInResult<F>;
export type EffectsOut<
  E extends EffectsIn<MOut, S>,
  MOut extends MethodsOut<MethodsIn<S>>,
  S = any
> = {
  [K in keyof E]: EffectOut<E[K]>;
};
