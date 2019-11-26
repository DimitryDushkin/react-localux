import React, { useCallback, useMemo } from "react";
import ReactDOM from "react-dom";

import { defaultState, useItemsStore } from "./example-store";

function ItemScreen() {
  const { Provider } = useItemsStore;
  return (
    <Provider initialState={defaultState}>
      <Item />
      <hr />
      <MethodsConsumerNoRerendering />
      <hr />
      <StateSlice />
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

let methodsConsumerRerenderingCounter = 0;
function MethodsConsumerNoRerendering() {
  const { effects } = useItemsStore();

  return useMemo(
    () => (
      <div>
        <p>
          This component using only methods and should not be re-rendered ever
        </p>
        <p>{`Rerender counter: ${methodsConsumerRerenderingCounter++}`}</p>
        <button onClick={effects.loadItem}>
          Load item from memo component
        </button>
      </div>
    ),
    [effects]
  );
}

let stateSliceRerenderingCounter = 0;
function StateSlice() {
  const {
    state: { error },
    effects
  } = useItemsStore();
  return useMemo(
    () => (
      <div>
        <h5>Check re-renders with state slicing</h5>
        <p>
          This component rerenders only on state.error changes (error on load)
        </p>
        <p>{`Rerender counter: ${stateSliceRerenderingCounter++}`}</p>
        <button onClick={effects.loadItem}>
          Load item from memo component
        </button>
      </div>
    ),
    [error]
  );
}

ReactDOM.render(<ItemScreen />, document.querySelector(".app"));
