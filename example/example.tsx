import React, { useMemo, memo } from "react";
import ReactDOM from "react-dom";
import { useItemsStore, defaultState, loadItem } from "./store";

function ItemScreen() {
  const { Provider } = useItemsStore;
  return (
    <Provider initialState={defaultState}>
      <Item />
      <hr />
      <ItemTestMemo />
    </Provider>
  );
}

function Item() {
  const { state, methods } = useItemsStore();
  const handleLoadClick = useMemo(() => loadItem(methods), []);

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

let itemTestRerenderCounter = 0;
const ItemTestMemo = memo(ItemTest);
function ItemTest() {
  const { methods } = useItemsStore();
  const handleLoadClick = useMemo(() => loadItem(methods), []);

  return (
    <div>
      <p>
        This component using only methods and should not be re-rendered ever
      </p>
      <p>{`Rerender counter: ${itemTestRerenderCounter++}`}</p>
      <button onClick={handleLoadClick}>Load item from memo component</button>
    </div>
  );
}

ReactDOM.render(<ItemScreen />, document.querySelector(".app"));
