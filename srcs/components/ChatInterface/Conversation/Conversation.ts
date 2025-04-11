import { createElement, defineComponent } from "../../../uccello/Uccello.js";
import FriendInfoBar from "./FriendInfoBar/FriendInfoBar.js";
import Messages from "./Messages/Messages.js";
import SendMessage from "./SendMessage/SendMessage.js";

const Conversation = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "div",
      {
        class: ["w-[70%]", "h-full"],
      },
      [
        createElement(FriendInfoBar),
        createElement(Messages),
        createElement(SendMessage),
      ]
    );
  },
});

export default Conversation;
