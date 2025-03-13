import { state } from "./state.js";
import { reducers } from "./reducers.js";
import { createApp } from "./uccello/Uccello.js";
import App from "./app.js";
const ROOT = document.getElementById("root");
createApp({
    state,
    reducers,
    view: (state, emit) => App(state, emit),
}).mount(ROOT);
