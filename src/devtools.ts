let id = 0

declare global {
    interface Window { __REDUX_DEVTOOLS_EXTENSION__: any; }
}

export function tryCreateDevToolsLogger<S>() {
    if (!('__REDUX_DEVTOOLS_EXTENSION__' in window)) {
        return;
    }

    const reduxDevTools = window.__REDUX_DEVTOOLS_EXTENSION__;
    const instanceID = id;

    id += 1

    const devTools = reduxDevTools.connect({
        name: `react-relocalux - ${instanceID}`,
        features: {},
    });

    return (action: string, state: S) => {
        devTools.send(action, state, {}, instanceID);
    }
}