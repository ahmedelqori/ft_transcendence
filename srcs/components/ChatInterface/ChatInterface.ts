import { createElement, defineComponent } from "../../uccello/Uccello.js";

const ChatInterface = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "section",
      {
        class: [
          "w-[90%]",
          "h-full",
          "rounded-[30px]",
          "border-[#878787]",
          "border-2",
          "p-[20px]",
          "border-opacity-[30%]",
          "z-10",
        ],
      },
      [""]
    );
  },
});

export default ChatInterface;
