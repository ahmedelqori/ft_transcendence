import { createElement, defineComponent } from "../uccello/Uccello.js";

const Chat = defineComponent<void>({
  state() {},
  render() {
    return createElement("div", { class: ["col-span-3"] }, ["Chat Page"]);
  },
});

export default Chat;
