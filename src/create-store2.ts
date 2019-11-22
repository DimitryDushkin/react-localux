type MyStoreState = {
  item?: string;
};

type MethodIn<S = any> = (state: S) => (...args: any[]) => S;
type MethodsIn<S = any> = Record<string, MethodIn<S>>;
type ExtractMethodInArgs<F> = F extends (
  state: any
) => (...args: infer Args) => any
  ? Args
  : never;
type MethodOut<F> = (...args: ExtractMethodInArgs<F>) => void;
type MethodsOut<M extends MethodsIn> = {
  [K in keyof M]: MethodOut<M[K]>;
};

type ExtractStateFromMethodsIn<M> = M extends MethodsIn<infer S> ? S : unknown;
type ExtractStateFromMethodsOut<M> = M extends MethodsOut<MethodsIn<infer S>>
  ? S
  : unknown;
type ExtractEffectInArgs<F> = F extends (
  getState: () => any,
  methods: any
) => (...args: infer Args) => any
  ? Args
  : never;

type EffectIn<MOut extends MethodsOut<MethodsIn>> = (
  getState: () => ExtractStateFromMethodsOut<MOut>,
  methods: MOut
) => (...args: any[]) => any;

type EffectsIn<MOut extends MethodsOut<MethodsIn>> = Record<
  string,
  EffectIn<MOut>
>;

// Replace any with ExtractEffectInResult
type EffectOut<F> = (...args: ExtractEffectInArgs<F>) => any;
type EffectsOut<
  E extends EffectsIn<MOut>,
  MOut extends MethodsOut<MethodsIn>
> = {
  [K in keyof E]: EffectOut<E[K]>;
};

const createMethods = <S, M extends MethodsIn<S>>(
  methodsIn: M,
  initialState: S
): MethodsOut<M> => {
  return (methodsIn as any) as MethodsOut<M>;
};

const createEffects = <
  E extends EffectsIn<MOut>,
  MOut extends MethodsOut<MethodsIn>
>(
  effects: E,
  methods: MOut
): EffectsOut<E, MOut> => {
  return (effects as any) as EffectsOut<E, MOut>;
};

const myMethods = createMethods(
  {
    setItem: state => (item: string) => ({
      item
    })
  },
  {} as MyStoreState
);
const myEffects = createEffects(
  {
    asyncUpdateItem: (getState, methods) => async (delay: number) => {
      // await new Promise(() => {});
      const s = getState();
      methods.setItem("ola!");
    }
  },
  myMethods
);

const createUseStore = <
  S extends any,
  MIn extends MethodsIn<S>,
  E extends EffectsIn<MethodsOut<MIn>>
>(
  defaultState: S,
  methodsIn: MIn,
  effectsIn: E
) => {
  const methodsOut = createMethods(methodsIn, defaultState);
  return {
    methods: methodsOut,
    effects: createEffects(effectsIn, methodsOut)
  };
};

const myStore = createUseStore(
  {} as MyStoreState,
  {
    setItem: s => (item: string) => ({
      item
    })
  },
  {
    asyncSetItem: (getState, methods) => async (someArg: string) => {
      methods.setItem("olala");
      return getState();
    }
  }
);
myStore.methods.setItem("s");
myStore.effects.asyncSetItem("eeee");
