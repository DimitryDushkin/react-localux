# React Virgin Store 🐛 — context-based store for React

React Virgin Store (RVS) is comfortable solution for separation store-related logic from react components. Unlike Redux **main goal for RVS is being home for compact local stores of smart components**.

For example, you might have screen-like component of some item with vast logic related to this screen and it is required to support several different stacked screens of such items. Implementing such feature with global _Redux store might result tricky code_, but it turns out that using _single local store for each screen produces quite straightforward solution_.

## Example code (from [example.tsx](example/example.tsx))
```tsx
// item-store.ts
import { RVSThunk, createStore } from '../index';

type $PartialMap <T extends object> = {
    [P in keyof T] ?: T[P];
};
const pause = async (timeout: number): Promise<any> =>
    new Promise(resolve => setTimeout(resolve, timeout));

type State = {
    loading: boolean,
    data?: string,
    error?: boolean,
};
const initialState: State = {
    loading: false,
};
const actions = {
    loadItem: (): RVSThunk<State, Promise<void>> => async (_, setState) => {
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
}

```


## TODO
* Add middleware support and support Redux Dev Tools
* Add tests

## Credits
Many thanks to [@didierfranc](https://github.com/didierfranc) for **[react-waterfall](https://github.com/didierfranc/react-waterfall)** as inspiration for this library. We have been using it for a while in our project, but met some problems:
* No TypeScript support
* No thunk-like actions support
* Not very performant code on store creation

That's why this library has been born. 👭

Also thanks to [@viventus](https://github.com/viventus) for helpfull discussions.
