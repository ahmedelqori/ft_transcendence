import { createElement, defineComponent } from "../uccello/Uccello.js";

const Game = defineComponent<void>({
  state() {},
  render() {
    return createElement("main", {}, ["Game Page"]);
  },
});

export default Game;
