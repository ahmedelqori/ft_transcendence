import {
  createElement,
  defineComponent,
} from "../../../../../uccello/Uccello.js";

const ReceivedMessage = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "div",
      {
        class: [
          "px-3",
          "py-3",
          "self-start",
          "bg-[#111111]",
          "bg-opacity-[80%]",
          "bg-transparent",
          "rounded-[14px]",
          "rounded-br-xl",
          "rounded-t-xl",
          "max-w-[40%]",
          "w-fit",
          "text-[14px]",
        ],
      },
      [
        "Ready, set, serve! Let the ping pong game begin now, and Play hard, aim high, and never stop chasing the win!",
      ]
    );
  },
});

export default ReceivedMessage;
