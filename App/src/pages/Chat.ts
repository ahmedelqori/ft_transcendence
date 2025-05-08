import ChatInterface from "@/components/ChatInterface/ChatInterface.js";
import { createElement, defineComponent, eventBus } from "@/uccello/Uccello.js";

const Chat = defineComponent<void>({
  onMounted() {
    document.title = "Chat";
    eventBus.emit("navigate:bar", { data: "/chat" });
  },
  state() {},
  render() {
    return createElement(
      "main",
      {
        class: ["flex", "w-full", "flex-col", "gap-[20px]", "items-start"],
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
              "gap-3",
              "justify-start",
              "max-xl:text-[14px]",
              "max-xl:gap-3",
              "text-[var(--light-grey)]",
            ],
          },
          [
            createElement(
              "div",
              {
                class: [
                  "flex-row",
                  "text-[var(--main-color)]",

                  "gap-6",
                  "max-xl:gap-2",
                  "text-4xl",
                  "max-xl:text-[18px]",
                ],
              },
              [
                createElement("i", {
                  class: [
                    "flex-row",
                    "ph",
                    "ph-chats",
                    "text-6xl",
                    "max-xl:text-[28px]",
                  ],
                }),
                "Chat",
              ]
            ),
            "Stay connected with friends while you play! Our in-game chat feature lets you easily communicate with your friends during your ping pong matches.",
          ]
        ),
        createElement(ChatInterface),
      ]
    );
  },
});

export default Chat;
