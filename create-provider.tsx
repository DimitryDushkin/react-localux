import React from 'react';
import {RLSetState} from './index';

export type RLProviderProps<S> = {
    children:
        React.ReactElement<any>
        | ((state: S) => React.ReactElement<any>)
        | null,
};

export function createProvider<S extends {}>(
    init: (getState: () => S, setState: RLSetState<S>) => void,
    Provider: React.Provider<S>,
    initialState: S,
): React.ComponentClass<RLProviderProps<S>, S> {
    return class RLProvider extends React.Component<RLProviderProps<S>, S> {
        constructor(props: RLProviderProps<S>) {
            super(props);

            this.state = initialState;

            const setState = this.setState.bind(this) as RLSetState<S>;

            init(
                () => this.state,
                setState,
            );
        }

        public render() {
            const {children} = this.props;

            return (
                <Provider value={this.state}>{
                    typeof children  === 'function'
                        ? children(this.state)
                        : children
                }</Provider>
            );
        }
    };
}
