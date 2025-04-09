import { createElement, defineComponent } from "../uccello/Uccello.js";

const Chat = defineComponent<void>({
  state() {},
  render() {
    return createElement("div", {}, ["Chat Page"]);
  },
});

export default Chat;
