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
        class: ["relative", "flex", "items-center", "flex-row"],
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
            "rounded-[14px]",
            "w-[525px]",
            "h-[50px]",
            "bg-transparent",
            "border-[#878787]",
            "border-2",
            "px-4",
            "py-4",
            "pr-[50px]",
            "focus:border-[#828c3a]",
            "text-[#878787]",
            "focus:outline-none",
          ],
        }),
        createElement("i", {
          class: [
            "fa-solid",
            "fa-magnifying-glass",
            "text-xl",
            "text-[#878787]",
            "absolute",
            "right-[20px]",
          ],
        }),
      ]
    );
  },
});

export default Searchbar;
