let id = 0

export function createDevToolsLogger<S>() {
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