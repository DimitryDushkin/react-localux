import { createUseStore } from "../src/create-use-store";

// example-store.ts
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
