import {
  createElement,
  defineComponent,
  IComponent,
} from "../../../../uccello/Uccello.js";

interface SearchState {
  inputValue: string;
}

const Search = defineComponent<SearchState>({
  state() {
    return { inputValue: "" };
  },
  render(this: IComponent<SearchState>) {
    return createElement(
      "div",
      {
        class: ["relative", "flex", "items-center", "flex-row", "mb-2"],
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
            "pr-[50px]",
            "focus:border-[#828c3a]",
            "text-[#878787]",
            "focus:outline-none",
            "border-opacity-[30%]",
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

export default Search;
