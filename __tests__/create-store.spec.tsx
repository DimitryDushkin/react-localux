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

const DATA_FROM_EFFECT = "DATA_FROM_EFFECT";
const wait = (timeout: number): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
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
      delayedSetDataEffect: (_, methods) => async () => {
        await wait(100);
        methods.setData(DATA_FROM_EFFECT);
      },
      getStateEffect: getState => () => {
        return getState();
      },
      getBothInitialAndMutatedState: (getState, methods) => async () => {
        const initial = getState();
        methods.setData(DATA_FROM_EFFECT);
        await wait(10);
        const mutated = getState();
        return {
          initial,
          mutated
        };
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

      return (
        <button onClick={effects.delayedSetDataEffect}>some button</button>
      );
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

  it("executes async effect with methods correctly", async () => {
    jest.useFakeTimers();

    const useStore = createUseTestStore();

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
      const { effects } = useStore();
      return <button onClick={effects.delayedSetDataEffect}>Op</button>;
    }

    const app = create(<App />);

    await act(async () => {
      const promiseWithSetTimeoutInside = app.root
        .findByType("button")
        .props.onClick();
      jest.runOnlyPendingTimers();
      await promiseWithSetTimeoutInside;
    });

    expect(app.root.findByType(State).children).toEqual([
      JSON.stringify({ isLoading: false, data: DATA_FROM_EFFECT })
    ]);
  });

  it("provides correct getState results within effects", async () => {
    jest.useFakeTimers();

    const useStore = createUseTestStore();

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
      const { effects, methods } = useStore();
      return (
        <>
          <button onClick={methods.setAnyData}>Call method</button>
          <button onClick={effects.getStateEffect}>
            Call effect, returning state
          </button>
        </>
      );
    }

    const app = create(<App />);

    act(() => {
      const [callMethodButton] = app.root.findAllByType("button");
      callMethodButton.props.onClick();
    });

    act(() => {
      const [_, callEffectButton] = app.root.findAllByType("button");
      const resultedState = callEffectButton.props.onClick();
      expect(resultedState).toEqual({
        isLoading: false,
        data: "any"
      });
    });
  });

  it("should return different states in async effect, that changes state", async () => {
    jest.useRealTimers();

    const useStore = createUseTestStore();

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
      const { effects } = useStore();
      return (
        <button onClick={effects.getBothInitialAndMutatedState}>Op</button>
      );
    }

    const app = create(<App />);

    await act(async () => {
      const { initial, mutated } = await app.root
        .findByType("button")
        .props.onClick();
      expect(initial).toEqual(defaultState);
      expect(mutated).toEqual({
        isLoading: false,
        data: DATA_FROM_EFFECT
      });
    });
  });
});
