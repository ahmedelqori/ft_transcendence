import {
  createElement,
  defineComponent,
  IComponent,
} from "../../../../../uccello/Uccello.js";

const ReceivedMessage = defineComponent<void, { message: string }>({
  state() {},
  render(this: IComponent<void, { message: string }>) {
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
          "w-auto",
          "text-[14px]",
          "min-h-[auto]",
          "break-all",
        ],
      },
      [this.props.message]
    );
  },
});

export default ReceivedMessage;
