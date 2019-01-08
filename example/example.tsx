// item-store.ts
import { RVSThunk, createStore } from '../index';

// Utils
type $PartialMap <T extends object> = {[P in keyof T] ?: T[P]};
const pause = async (timeout: number): Promise<any> => new Promise(resolve => setTimeout(resolve, timeout));

type State = {
    loading: boolean,
    data?: string,
    error?: boolean,
};

const initialState: State = {
    loading: false,
};
const actions = {
    loadItem: (): RVSThunk<State, Promise<void>> => async (getState, setState) => {
        // You might need state in action
        const state = getState();

        setState(actions.loading());
        // Pretend making API call which can fail
        await pause(1000);
        if (Math.random() > 0.5) {
            setState(actions.loadSucess('Hooray!😁'));
        } else {
            setState(actions.loadFailed());
        }
    },
    loading: (): $PartialMap<State> => ({
        loading: true,
        error: false,
    }),
    loadSucess: (data: string): $PartialMap<State> => ({
        loading: false,
        data,
    }),
    loadFailed: (): $PartialMap<State> => ({
        loading: false,
        error: true,
    })
};

const createItemStore = () => {
    return createStore(
        initialState,
        actions,
    );
}
type ItemStore = ReturnType<typeof createItemStore>;

// item-screen.tsx
import React from 'react';

export class ItemScreen extends React.Component {
    store: ItemStore;
    constructor(props: any) {
        super(props);

        this.store = createItemStore();
    }

    public componentDidMount() {
        const { actions } = this.store;
        actions.loadItem();
    }

    public render() {
        const {
            Provider
        } = this.store;

        return (
            <Provider>{
                store => (
                    <div>
                        <h1>Item Screen</h1>
                        {store.loading && <p>Loading...</p>}
                        {store.error && <p>Error loading 😕</p>}
                        {store.data && <p>Data loaded 🎆: {store.data}</p>}
                    </div>
                )
            }
            </Provider>
        );
    }

    // Alternative use of Provider
    public alternativeRender() {
        const {
            Provider,
            Consumer
        } = this.store;

        return (
            <Provider>
                <Consumer>{
                    store => ("...")
                }
                </Consumer>
            </Provider>
        );
    }
}
