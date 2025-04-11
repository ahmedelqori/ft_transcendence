import { createElement, defineComponent } from "../../../../uccello/Uccello.js";
import ReceivedMessage from "./ReceivedMessage/ReceivedMessage.js";
import SentMessage from "./SentMessage/SentMessage.js";

const Messages = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "div",
      {
        class: [
          "w-full",
          "w-[90%]",
          "overflow-scroll",
          "overflow-x-hidden",
          "gap-4",
          "px-4",
          "[&::-webkit-scrollbar]:w-1",
          "[&::-webkit-scrollbar-track]:rounded-full",
          "[&::-webkit-scrollbar-track]:bg-gray-100",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-thumb]:bg-gray-300",
          "dark:[&::-webkit-scrollbar-track]:bg-transparent",
          "dark:[&::-webkit-scrollbar-thumb]:bg-[#ddf247]",
          "dark:[&::-webkit-scrollbar-thumb]:bg-opacity-[70%]",
        ],
      },
      [
        createElement(ReceivedMessage),
        createElement(ReceivedMessage),
        createElement(SentMessage),
        createElement(SentMessage),
        createElement(ReceivedMessage),
        createElement(ReceivedMessage),
        createElement(ReceivedMessage),
        createElement(ReceivedMessage),
        createElement(SentMessage),
        createElement(SentMessage),
      ]
    );
  },
});

export default Messages;
