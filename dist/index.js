import Home from "./pages/Home.js";
import * as Uccello from "./uccello/Uccello.js";
const ROOT = document.getElementById("root");
Uccello.createApp({
    state: {
        item: "Meedivo",
        list: ["task one", "task two"],
    },
    reducers: {
        "add-todo": (state, payload) => ({
            ...state,
            list: [payload, ...state.list],
        }),
        "input-change": (state, payload) => ({
            ...state,
            item: payload,
        }),
        "clear-input": (state, payload) => ({
            ...state,
            item: "",
        }),
    },
    view: (state, emit) => Home({ state, emit }),
}).mount(ROOT);
