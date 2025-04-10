import ChatInterface from "../components/ChatInterface/ChatInterface.js";
import { createElement, defineComponent } from "../uccello/Uccello.js";

const Chat = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "main",
      {
        class: [
          "col-span-3",
          "w-full",
          "h-[90%]",
          "mt-[20px]",
          "items-start",
          "flex",
          "flex-col",
          "gap-[20px]",
        ],
      },
      [
        createElement("div", { class: ["items-start"] }, [
          createElement(
            "div",
            {
              class: ["items-start", "w-[60%]", "justify-start"],
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
              "Stay connected with friends while you play! Our in-game chat feature lets you easily communicate with your friends during your ping pong matches.",
            ]
          ),
        ]),
        createElement(ChatInterface),
      ]
    );
  },
});

export default Chat;
