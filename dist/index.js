import * as Uccello from "./uccello/Uccello.js";
const ROOT = document.getElementById("root");
Uccello.createApp({
    state: 0,
    reducers: {
        add: (state, amount) => state + amount,
    },
    view: (state, emit) => Uccello.createElement("button", { on: { click: () => emit("add", 1) } }, [
        Uccello.createString(state),
    ]),
}).mount(ROOT);
