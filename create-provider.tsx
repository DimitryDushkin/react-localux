import React from 'react';
import { RLSetState } from './index';

export type RLProviderProps<S> = {
    children: React.ReactElement<any>
        | ((state: S) => React.ReactElement<any>)
        | null,
};

export function createProvider<S extends {}, E>(
    init: (getState: () => S, setState: RLSetState<S, any, E>) => void,
    Provider: React.Provider<S>,
    initialState: S,
): React.ComponentClass<RLProviderProps<S>, S> {
    return class RLProvider extends React.Component<RLProviderProps<S>, S> {
        private isMounted = true;

        constructor(props: RLProviderProps<S>) {
            super(props);

            this.state = initialState;

            const setState = (state: any, callback?: () => void) => {
                if (!this.isMounted) {
                    return;
                }

                this.setState(state, callback);
            };

            init(
                () => this.state,
                setState,
            );
        }

        public componentWillUnmount() {
            this.isMounted = false;
        }

        public render() {
            const { children } = this.props;

            return (
                <Provider value={this.state}>{
                    typeof children === 'function'
                        ? children(this.state)
                        : children
                }</Provider>
            );
        }
    };
}
