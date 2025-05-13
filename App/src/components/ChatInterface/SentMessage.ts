import {
  createElement,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";

const SentMessage = defineComponent<void, { message: string }>({
  state() {},
  render(this: IComponent<void, { message: string }>) {
    return createElement(
      "div",
      {
        class: [
          "px-3",
          "py-3",
          "w-fit",
          "self-end",
          "break-all",
          "font-medium",
          "rounded-t-xl",
          "max-w-[40%]",
          "text-[14px]",
          "min-h-[auto]",
          "rounded-bl-xl",
          "text-[#ffffff]",
          "bg-[#111111]",
          "max-lg:text-xs",
        ],
      },
      [this.props.message]
    );
  },
});

export default SentMessage;
