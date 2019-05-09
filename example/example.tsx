import React, { useMemo, useCallback } from "react";
import ReactDOM from "react-dom";
import { useItemsStore, defaultState, loadItem } from "./store";

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
  const { state, methods } = useItemsStore();
  const handleLoadClick = useCallback(loadItem(methods), []);

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

let methodsConsumerRerenderingCounter = 0;
function MethodsConsumerNoRerendering() {
  const { methods } = useItemsStore();
  const handleLoadClick = useCallback(loadItem(methods), []);

  return useMemo(
    () => (
      <div>
        <p>
          This component using only methods and should not be re-rendered ever
        </p>
        <p>{`Rerender counter: ${methodsConsumerRerenderingCounter++}`}</p>
        <button onClick={handleLoadClick}>Load item from memo component</button>
      </div>
    ),
    []
  );
}

let stateSliceRerenderingCounter = 0;
function StateSlice() {
  const {
    state: { error },
    methods
  } = useItemsStore();
  return useMemo(
    () => (
      <div>
        <p>
          This component rerenders only on state.error changes (error on load)
        </p>
        <p>{`Rerender counter: ${stateSliceRerenderingCounter++}`}</p>
        <button onClick={loadItem(methods)}>
          Load item from memo component
        </button>
      </div>
    ),
    [error]
  );
}

ReactDOM.render(<ItemScreen />, document.querySelector(".app"));
