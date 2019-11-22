// item-store.ts
import { createUseStore, Thunk } from "../src/create-store";

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
type Methods = typeof methods;
const thunks = {
  loadItem: (state: State, methods: Methods) => async () => {
    methods.loading();
    // Pretend making API call which can fail
    await pause(1000);
    if (Math.random() > 0.5) {
      methods.loadSuccess("Hooray!😁");
    } else {
      methods.loadFailed();
    }
  }
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
