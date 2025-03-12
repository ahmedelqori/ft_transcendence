import * as Uccello from "./uccello/Uccello.js";

const ROOT: HTMLElement = document.getElementById("root") as HTMLElement;

Uccello.createApp({
  state: 0,
  reducers: {
    add: (state: any, amount: any) => state + amount,
  },
  view: (state: any, emit: any) =>
    Uccello.createElement("button", { on: { click: () => emit("add", 1) } }, [
      Uccello.createString(state),
    ]),
}).mount(ROOT);
