import React from 'react';
import {RVSetState} from './index';

export type RVSProviderProps<S> = {
    children:
        React.ReactElement<any>
        | ((state: S) => React.ReactElement<any>)
        | null,
};

export function createProvider<S extends {}>(
    init: (getState: () => S, setState: RVSetState<S>) => void,
    Provider: React.Provider<S>,
    initialState: S,
): React.ComponentClass<RVSProviderProps<S>, S> {
    return class RVSProvider extends React.Component<RVSProviderProps<S>, S> {
        constructor(props: RVSProviderProps<S>) {
            super(props);

            this.state = initialState;

            const setState = this.setState.bind(this) as RVSetState<S>;

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
