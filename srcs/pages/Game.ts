import { createElement, defineComponent } from "../uccello/Uccello.js";

const Game = defineComponent<void>({
  state() {},
  render() {
    return createElement("div", {}, ["Game Page"]);
  },
});

export default Game;
