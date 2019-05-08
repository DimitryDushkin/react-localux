// item-screen.tsx
import React, { useCallback } from "react";
import ReactDOM from "react-dom";
import { useItemsStore, defaultState, loadItem } from "./store";

function ItemScreen() {
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

ReactDOM.render(<ItemScreen />, document.querySelector(".app"));
