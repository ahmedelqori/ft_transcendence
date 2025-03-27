// import { state } from "./state.js";
// import { reducers } from "./reducers.js";
// import { createApp } from "./uccello/Uccello.js";
// import App from "./app.js";
import RandomCocktail from "./components/RandomCocktail.js";
import { Counter } from "./components/tmp.js";
const ROOT: HTMLElement = document.getElementById("root") as HTMLElement;

// createApp({
//   state,
//   reducers,
//   view: (state: any, emit: any) => App(state, emit),
// }).mount(ROOT);

// const fly = new Counter({});

// fly.mount(ROOT);

const Comp = new RandomCocktail({});
Comp.mount(ROOT);
