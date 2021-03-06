# React Localux 🐬 — context and hooks based store for React, TypeScript-friendly

[![npm version](https://badge.fury.io/js/react-localux.svg)](https://www.npmjs.com/package/react-localux)

React Localux is comfortable solution for separation store-related logic from react components. Unlike Redux **main goal for React Localux is being home for compact local stores of smart components**. Based on `useReducer` and new Context API.

For example, you might have screen-like component of some item with vast logic related to this screen and it is required to support several different stacked screens of such items. Implementing such feature with _global Redux store result complicated code_, but it turns out that using _single local store for each screen produces quite straightforward solution_.

_React 16.8+ only, because it uses hooks (useReducer mainly)_. For React < 16.8 see v1.

## Main features

- Compact creation of store: just declare state, methods (combination of reducers and actions) and effects
- Thunk-like actions support — effects
- Default state support (handy for unit-testing)
- Redux dev tools logging support
- TypeScript first! Typings for all methods and effects for free.
- API based on hooks
- Lightweight: [1.7 Kb minified, 819 b gzip](https://bundlephobia.com/result?p=react-localux@3.1.0)

## Example code (from [example.tsx](example/example.tsx))

```bash
npm i react-localux constate
```

```tsx
// example-store.ts
import { createUseStore } from "react-localux";

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

export const useItemsStore = createUseStore(
  defaultState,
  {
    loading: () => () => ({
      loading: true
    }),
    loadSuccess: state => (data: string) => ({
      ...state,
      loading: false,
      data
    }),
    loadFailed: state => () => ({
      ...state,
      loading: false,
      error: true
    })
  },
  {
    loadItem: (_, methods) => async () => {
      methods.loading();
      // Pretend making API call which can fail
      await pause(1000);
      if (Math.random() > 0.5) {
        methods.loadSuccess("Hooray!😁");
      } else {
        methods.loadFailed();
      }
    }
  }
);

// exampleComponent.tsx
function ItemScreen() {
  const { Provider } = useItemsStore;
  return (
    <Provider initialState={defaultState}>
      <Item />
    </Provider>
  );
}

function Item() {
  const { state, effects } = useItemsStore();

  return (
    <div>
      <h1>Item Screen</h1>
      {state.loading && <p>Loading...</p>}
      {state.error && <p>Error loading 😕</p>}
      {state.data && <p>Data loaded 🎆: {state.data}</p>}
      <button onClick={effects.loadItem}>Load item</button>
    </div>
  );
}

/**
 * If you need just slice of state and do not want re-renders
 * on other state parts change, you can do such optimization with useMemo
 **/
function ItemOptimized() {
    const { state } = useItemsStore();
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

[Alveron](https://github.com/rofrischmann/alveron) is really good lib with good documentation:

- No TypeScript support and due to API design decision for actions it is not possible to make types (looks like it is possible now with TS 3.7)
- No redux dev tools logging

[Use methods](https://github.com/pelotom/use-methods)

- No async actions support built-in
- No redux dev tools logging
- API based on ambiguous immer (immer adds 4.3 Kb gzip). Immer adds performance penality on every action call, up to 15x on browsers without Proxy and 2x-3x on others.

[Constate](https://github.com/diegohaz/constate)

- It is more "put any hook inside context" then complete store solution.
- [No default state support](https://github.com/diegohaz/constate/pull/40), which is usefull for unit-testing.

That's why this library has been born. 👭

## Credits

Thanks to [@viventus](https://github.com/viventus) for helpfull discussions.

Thanks to [Constate library](https://github.com/diegohaz/constate) for simple solution for placing hooks inside context.
