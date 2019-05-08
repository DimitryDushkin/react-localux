// item-store.ts
import { createUseStore, Thunk } from "../src/create-store";
import { useState } from "react";
import createUseContext from "constate";

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
