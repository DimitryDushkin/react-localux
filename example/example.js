"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// item-store.ts
const index_1 = require("../index");
const pause = (timeout) => __awaiter(this, void 0, void 0, function* () { return new Promise(resolve => setTimeout(resolve, timeout)); });
const initialState = {
    loading: false,
};
const actions = {
    loadItem: () => (_, setState) => __awaiter(this, void 0, void 0, function* () {
        setState(actions.loading());
        // Pretend making API call which can fail
        yield pause(1000);
        if (Math.random() > 0.5) {
            setState(actions.loadSucess('Hooray!😁'));
        }
        else {
            setState(actions.loadFailed());
        }
    }),
    loading: () => ({
        loading: true,
        error: false,
    }),
    loadSucess: (data) => ({
        loading: false,
        data,
    }),
    loadFailed: () => ({
        loading: false,
        error: true,
    })
};
const createItemStore = () => {
    return index_1.createStore(initialState, actions);
};
// item-screen.tsx
const react_1 = __importDefault(require("react"));
class ItemScreen extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.store = createItemStore();
    }
    componentDidMount() {
        const { actions } = this.store;
        actions.loadItem();
    }
    render() {
        const { Provider } = this.store;
        return (react_1.default.createElement(Provider, null, store => (react_1.default.createElement("div", null,
            react_1.default.createElement("h1", null, "Item Screen"),
            store.loading && react_1.default.createElement("p", null, "Loading..."),
            store.error && react_1.default.createElement("p", null, "Error loading \uD83D\uDE15"),
            store.data && react_1.default.createElement("p", null,
                "Data loaded \uD83C\uDF86: ",
                store.data)))));
    }
}
exports.ItemScreen = ItemScreen;
