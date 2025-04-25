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
        class: ["flex", "w-full", "flex-col", "my-auto","gap-[20px]", "items-start"],
      },
      [
        createElement(
          "div",
          {
            class: [
              "items-start",
              "max-lg:h-full",
              "max-lg:hidden",
              "w-[80%]",
              "justify-start",
              "max-xl:text-[14px]",
              "max-xl:gap-3",
            ],
          },
          [
            createElement(
              "div",
              {
                class: [
                  "flex-row",
                  "gap-5",
                  "max-xl:gap-2",
                  "text-[24px]",
                  "max-xl:text-[18px]",
                ],
              },
              [
                createElement("i", {
                  class: [
                    "flex-row",
                    "ph",
                    "ph-chats",
                    "text-[46px]",
                    "max-xl:text-[28px]",
                  ],
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
