import {
  createElement,
  defineComponent,
  IComponent,
} from "../../../../../uccello/Uccello.js";

interface SearchBarState {
  inputValue: string;
}

const Searchbar = defineComponent<SearchBarState>({
  state() {
    return { inputValue: "" };
  },
  render(this: IComponent<SearchBarState>) {
    return createElement(
      "div",
      {
        class: [
          "flex",
          "hidden",
          "w-full",
          "relative",
          "lg:block",
          "items-center",
          "max-w-[525px]",
        ],
      },
      [
        createElement("input", {
          value: this.state.inputValue,
          placeholder: "Search, users...",
          on: {
            input: ({ target }) => {
              this.updateState({ inputValue: target.value });
            },
          },
          class: [
            "px-4",
            "py-4",
            "w-full",
            "h-[50px]",
            "border-2",
            "pr-[50px]",
            "rounded-[14px]",
            "text-[#878787]",
            "bg-transparent",
            "border-[#878787]",
            "focus:outline-none",
            "focus:border-[#828c3a]",
            "transition-all",
          ],
        }),
        createElement("i", {
          class: [
            "text-xl",
            "absolute",
            "fa-solid",
            "top-1/4",
            "right-[20px]",
            "text-[#878787]",
            "fa-magnifying-glass",
          ],
        }),
      ]
    );
  },
});

export default Searchbar;
