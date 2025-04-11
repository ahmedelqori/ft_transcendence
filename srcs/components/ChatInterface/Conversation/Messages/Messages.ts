import { createElement, defineComponent } from "../../../../uccello/Uccello.js";

const Messages = defineComponent<void>({
  state() {},
  render() {
    return createElement("div", {}, ["Messages"]);
  },
});

export default Messages;
