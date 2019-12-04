// import React, { useCallback, useMemo, useState } from 'react';
// import ReactDOM from 'react-dom';

// import { createUseStore, Thunk } from '../src/create-store';

// type State = {
//   data?: string;
//   isLoading?: boolean;
// };
// const defaultState: State = {
//   isLoading: true
// };

// const methods = {
//   setData: (_: State) => (data: string) => ({
//     isLoading: false,
//     data
//   })
// };

// const longThunk: Thunk<typeof methods> = methods => () => {
//   setTimeout(() => {
//     methods.setData("some data");
//   }, 1000);
// };

// const useStore = createUseStore(defaultState, methods);

// function ItemScreen() {
//   const [visible, setVisibility] = useState(true);

//   return (
//     <>
//       <button onClick={() => setVisibility(false)}>
//         Remove context provider
//       </button>
//       <hr />
//       {visible && (
//         <useStore.Provider initialState={defaultState}>
//           <ItemWithThunk />
//         </useStore.Provider>
//       )}
//     </>
//   );
// }

// function ItemWithThunk() {
//   const { methods } = useStore();

//   return <button onClick={longThunk(methods)}>Start long task</button>;
// }

// ReactDOM.render(<ItemScreen />, document.querySelector(".app  "));
