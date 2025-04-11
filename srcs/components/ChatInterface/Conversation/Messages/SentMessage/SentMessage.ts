import {
  createElement,
  defineComponent,
} from "../../../../../uccello/Uccello.js";

const SentMessage = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "div",
      {
        class: [
          "px-3",
          "py-3",

          "self-end",
          "rounded-bl-xl",
          "rounded-t-xl",
          "w-fit",
          "font-medium",
          "max-w-[40%]",
          "text-[14px]",
          "text-[#111111]",
          "bg-[#ffffff]",
        ],
      },
      ["Rally your way to victory!"]
    );
  },
});

export default SentMessage;
