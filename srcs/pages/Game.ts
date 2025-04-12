import { createElement, defineComponent } from "../uccello/Uccello.js";

const Game = defineComponent<void>({
  state() {},
  render() {
    return createElement("main", {class:["w-full"]}, ["Game Page"]);
  },
});

export default Game;
