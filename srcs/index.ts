import { state } from "./state.js";
import { reducers } from "./reducers.js";
import { createApp } from "./uccello/Uccello.js";
import App from "./app.js";

const ROOT: HTMLElement = document.getElementById("root") as HTMLElement;

createApp({
  state,
  reducers,
  view: (state: any, emit: any) => App(state, emit),
}).mount(ROOT);
