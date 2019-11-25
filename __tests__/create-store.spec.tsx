import React, { useState } from "react";
import { act, create } from "react-test-renderer";
import { NoProviderError } from "../src/utils";
import { createUseStore } from "../src/create-use-store";

type State = {
  data?: string;
  isLoading?: boolean;
};
const defaultState: State = {
  isLoading: true
};

const createUseTestStore = () =>
  createUseStore(
    defaultState,
    {
      setData: (_: State) => (data: string) => ({
        isLoading: false,
        data
      }),
      setAnyData: (_: State) => () => ({
        isLoading: false,
        data: "any"
      })
    },
    {
      longEffect: (_, methods) => () => {
        setTimeout(() => {
          methods.setData("some data");
        }, 0);
      }
    }
  );

describe("React Localux", () => {
  it("takes defaultState correctly if no high level Provider is present", () => {
    const useStore = createUseTestStore();

    function App() {
      const { state } = useStore();
      return <div>{JSON.stringify(state)}</div>;
    }

    const app = create(<App />);
    expect(app.root.findByType("div").children).toEqual([
      JSON.stringify(defaultState)
    ]);
  });

  it("throws error if methods have been called without high level Provider is present", () => {
    const useStore = createUseTestStore();

    function App() {
      const { methods } = useStore();
      return <button onClick={methods.setAnyData}>click</button>;
    }

    const app = create(<App />);

    act(() => {
      expect(() => app.root.findByType("button").props.onClick()).toThrowError(
        NoProviderError
      );
    });
  });

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

  it("not throw errors on method call of unmounted context", () => {
    const useStore = createUseTestStore();

    function App() {
      const [visible, setVisibility] = useState(true);

      return (
        <>
          <button onClick={() => setVisibility(false)}>some button</button>
          {visible && (
            <useStore.Provider initialState={defaultState}>
              <ItemWithThunk />
            </useStore.Provider>
          )}
        </>
      );
    }

    function ItemWithThunk() {
      const { effects } = useStore();

      return <button onClick={effects.longEffect}>some button</button>;
    }

    const app = create(<App />);

    act(() => {
      app.root
        .findByType(ItemWithThunk)
        .findByType("button")
        .props.onClick();

      const switchButton = app.root.children[0];
      typeof switchButton !== "string" && switchButton.props.onClick();
    });

    // find throws error if not found
    expect(() => app.root.findByType(ItemWithThunk)).toThrowError();
  });
});
