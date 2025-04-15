import ChatInterface from "../components/ChatInterface/ChatInterface.js";
import { createElement, defineComponent } from "../uccello/Uccello.js";

const Chat = defineComponent<void>({
  onMounted() {
    document.title = "Chat";
  },
  state() {},
  render() {
    return createElement(
      "main",
      {
        class: [
          "flex",
          "w-full",
          "flex-col",
          "gap-[20px]",
          "items-start",
        ],
      },
      [
        createElement(
          "div",
          {
            class: ["items-start", "max-lg:hidden", "w-[80%]", "justify-start"],
          },
          [
            createElement(
              "div",
              { class: ["flex-row", "gap-5", "text-[24px]"] },
              [
                createElement("i", {
                  class: ["flex-row", "ph", "ph-chats", "text-[46px]"],
                }),
                "Chat",
              ]
            ),
            "Play ping pong with friends. Chat while you play!",
          ]
        ),
        createElement(ChatInterface),
      ]
    );
  },
});

export default Chat;
