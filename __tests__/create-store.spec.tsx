import React from "react";
import { create, act } from "react-test-renderer";
import { createUseStore } from "../src/create-store";

type State = {
  data?: string;
  isLoading?: boolean;
};

const defaultState: State = {
  isLoading: true
};

const methods = {
  setData: (_: State) => (data: string) => ({
    isLoading: false,
    data
  })
};

const createUseTestStore = () => createUseStore(defaultState, methods);

describe("React Localux", () => {
  it("renders correctly initial state", () => {
    const useStore = createUseTestStore();

    function App() {
      return (
        <useStore.Provider initialState={defaultState}>
          <Item />
        </useStore.Provider>
      );
    }

    function Item() {
      const { state } = useStore();
      return <div>{JSON.stringify(state)}</div>;
    }

    const app = create(<App />);
    expect(app.root.findByType(Item).findByType("div").children).toEqual([
      JSON.stringify(defaultState)
    ]);
  });

  it("renders correctly after method call", () => {
    const useStore = createUseTestStore();
    const testData = "test data";

    function App() {
      return (
        <useStore.Provider initialState={defaultState}>
          <State />
          <ItemWithMethodCall />
        </useStore.Provider>
      );
    }

    function State() {
      const { state } = useStore();
      return <>{JSON.stringify(state)}</>;
    }

    function ItemWithMethodCall() {
      const { methods } = useStore();
      return <button onClick={() => methods.setData(testData)}>Op</button>;
    }

    const app = create(<App />);
    act(() => {
      app.root.findByType("button").props.onClick();
    });

    expect(app.root.findByType(State).children).toEqual([
      JSON.stringify({ isLoading: false, data: testData })
    ]);
  });
});
