# React Localux 🐬 — context and hooks based store for React, TypeScript-friendly

[![npm version](https://badge.fury.io/js/react-localux.svg)](https://www.npmjs.com/package/react-localux)

React Localux (RL) is comfortable solution for separation store-related logic from react components. Unlike Redux **main goal for RL is being home for compact local stores of smart components**.

For example, you might have screen-like component of some item with vast logic related to this screen and it is required to support several different stacked screens of such items. Implementing such feature with _global Redux store result complicated code_, but it turns out that using _single local store for each screen produces quite straightforward solution_.

_React 16.8+ only, because it uses hooks (useReducer mainly)_. For React < 16.8 see v1.

## Main features

- Compact creation of store: just declare state and methods (simple combination on reducers and actions)
- Async actions support
- Redux dev tools logging support
- Simple API based on hooks

## Example code (from [example.tsx](example/example.tsx))

```bash
npm i react-localux constate
```

```tsx
// item-store.ts
import { createUseStore, Thunk } from "react-localux";

const pause = async (timeout: number): Promise<any> =>
  new Promise(resolve => setTimeout(resolve, timeout));

type State = {
  loading: boolean;
  data?: string;
  error?: boolean;
};

export const defaultState: State = {
  loading: false
};
const methods = {
  loading: () => () => ({
    loading: true
  }),
  loadSuccess: (state: State) => (data: string) => ({
    ...state,
    loading: false,
    data
  }),
  loadFailed: (state: State) => () => ({
    ...state,
    loading: false,
    error: true
  })
};
type MyThunk = Thunk<typeof methods>;

export const loadItem: MyThunk = methods => async () => {
  methods.loading();
  // Pretend making API call which can fail
  await pause(1000);
  if (Math.random() > 0.5) {
    methods.loadSuccess("Hooray!😁");
  } else {
    methods.loadFailed();
  }
};

export const useItemsStore = createUseStore(defaultState, methods);

// components.tsx
function ItemScreen() {
  const { Provider } = useItemsStore;
  return (
    <Provider initialState={defaultState}>
      <Item />
    </Provider>
  );
}

function Item() {
  const { state, methods } = useItemsStore();
  const handleLoadClick = useMemo(() => loadItem(methods), []);

  return (
    <div>
      <h1>Item</h1>
      {state.loading && <p>Loading...</p>}
      {state.error && <p>Error loading 😕</p>}
      {state.data && <p>Data loaded 🎆: {state.data}</p>}
      <button onClick={handleLoadClick}>Load item</button>
    </div>
  );
}

/**
 * If you need just slice of state and do not want re-renders
 * on other state parts change, you can do such optimization with useMemo
 **/
function ItemOptimized() {
    const { state, methods } = useItemsStore();
    return useMemo(() => (
        <div>
          <h1>Item</h1>
          {state.data
            ? <p>{`Data loaded 🎆: ${state.data}`</p>
            : <p>Loading...</p>
          }
        </div>
    ), [state.data]);
}

```

Also see [tests](__tests__/create-store.spec.tsx).

## Similar solutions

[react-waterfall](https://github.com/didierfranc/react-waterfall):

- No TypeScript support and due to API design decision for actions it is not possible to make types
- No async actions support
- Not very performant code on store creation

[Alveron](https://github.com/rofrischmann/alveron):

- No TypeScript support

[Use methods](https://github.com/pelotom/use-methods)

- Strange performance solutions
- No async actions support built-in
- No Redux logging
- Heavy dependency on immer
- Immer

That's why this library has been born. 👭

## Credits

Thanks to [@viventus](https://github.com/viventus) for helpfull discussions.
Thanks to [Constate library](https://github.com/diegohaz/constate) for simple solution for placing hooks inside context.
