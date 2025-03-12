import Home from "./pages/Home.js";
import * as Uccello from "./uccello/Uccello.js";

const ROOT: HTMLElement = document.getElementById("root") as HTMLElement;

Uccello.createApp({
  state: {
    item: "Meedivo",
    list: ["task one", "task two"],
  },
  reducers: {
    "add-todo": (state: any, payload: string) => ({
      ...state,
      list: [payload, ...state.list],
    }),
    "input-change": (state: any, payload: string) => ({
      ...state,
      item: payload,
    }),
    "clear-input": (state: any, payload: any) => ({
      ...state,
      item: "",
    }),
  },
  view: (state: any, emit: any) => Home({ state, emit }),
}).mount(ROOT);
