import { createElement, defineComponent } from "../uccello/Uccello.js";

const LeaderBoard = defineComponent<void>({
  state() {},
  render() {
    return createElement("main", {}, ["LeaderBoard Page"]);
  },
});

export default LeaderBoard;
