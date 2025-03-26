// import { state } from "./state.js";
// import { reducers } from "./reducers.js";
// import { createApp } from "./uccello/Uccello.js";
// import App from "./app.js";
import { Counter } from "./components/tmp.js";
const ROOT: HTMLElement = document.getElementById("root") as HTMLElement;

// createApp({
//   state,
//   reducers,
//   view: (state: any, emit: any) => App(state, emit),
// }).mount(ROOT);

import {
  defineComponent,
  createFragment,
  createElement,
  IComponent,
} from "./uccello/Uccello.js";

interface TmpState {
  count: number;
}


const fly = new Counter({});

fly.mount(ROOT);

// export { Counter };
