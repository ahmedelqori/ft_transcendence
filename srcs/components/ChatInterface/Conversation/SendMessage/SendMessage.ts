import {
  createElement,
  defineComponent,
  IComponent,
} from "../../../../uccello/Uccello.js";

interface SearchState {
  inputValue: string;
}

const SendMessage = defineComponent<SearchState>({
  state() {
    return { inputValue: "" };
  },
  render(this: IComponent<SearchState>) {
    return createElement(
      "div",
      {
        class: [
          "relative",
          "w-[90%]",
          "flex",
          "items-center",
          "flex-row",
          "mb-2",
          "mt-6",
          "bg-[#878787]",
          "bg-opacity-[10%]",
          "rounded-[14px]",
        ],
      },
      [
        createElement("input", {
          value: this.state.inputValue,
          placeholder: "Search, users...",
          on: {
            input: ({ target }) => {
              this.updateState({ inputValue: target.value });
              console.log(this.state.inputValue);
            },
          },
          class: [
            "rounded-[14px]",
            "border-2",
            "w-full",
            "h-[70px]",
            "bg-transparent",
            "border-[#878787]",
            "px-4",
            "py-4",
            "text-[#878787]",
            "focus:outline-none",
            "border-opacity-[30%]",
          ],
        }),
        createElement("i", {
          class: [
            "ph",
            "ph-paper-plane-tilt",
            "text-xl",
            "text-[#878787]",
            "absolute",
            "right-[20px]",
            "hover:text-[#828c3a]",
          ],
        }),
      ]
    );
  },
});

export default SendMessage;
