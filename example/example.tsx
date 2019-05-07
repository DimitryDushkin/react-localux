// item-store.ts
import { createUseStore, Thunk } from "../src/create-store";

// Utils
const pause = async (timeout: number): Promise<any> =>
  new Promise(resolve => setTimeout(resolve, timeout));

type State = {
  loading: boolean;
  data?: string;
  error?: boolean;
};

const defaultState: State = {
  loading: false
};
const methods = {
  loading: (state: State) => () => ({
    ...state,
    loading: true,
    error: false
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

const loadItem: MyThunk = methods => async () => {
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

// item-screen.tsx
import React, { useCallback } from "react";

export function ItemScreen() {
  const { Provider } = useItemsStore;
  return (
    <Provider {...defaultState}>
      <Item />
    </Provider>
  );
}

// item.tsx
function Item() {
  const { state, methods } = useItemsStore();
  const handleLoadClick = useCallback(() => loadItem(methods), []);

  return (
    <div>
      <h1>Item Screen</h1>
      {state.loading && <p>Loading...</p>}
      {state.error && <p>Error loading 😕</p>}
      {state.data && <p>Data loaded 🎆: {state.data}</p>}
      <button onClick={handleLoadClick}>Load item</button>
    </div>
  );
}
