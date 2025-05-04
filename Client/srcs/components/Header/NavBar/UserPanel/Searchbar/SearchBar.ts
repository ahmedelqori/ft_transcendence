import enhancedFetch from "../../../../../Hooks/fetch.js";
import {
  createElement,
  defineComponent,
  IComponent,
} from "../../../../../uccello/Uccello.js";

interface SearchBarState {
  inputValue: string;
  suggestions: string[];
  allUsers: string[];
  showSuggestions: boolean;
}

const Searchbar = defineComponent<SearchBarState>({
  async onMounted(this: IComponent<SearchBarState>) {
    try {
      const res = await enhancedFetch.fetch(
        "https://64.23.191.17/api/account/users/"
      );
      const data = await res.json();
      console.log(data)
      this.updateState({ allUsers: data });
    } catch (err) {}
  },
  state() {
    return {
      inputValue: "",
      suggestions: [],
      allUsers: [],
      showSuggestions: false,
    };
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
          placeholder: "Search users...",
          on: {
            input: ({ target }: { target: any }) => {
              const value = target.value;
              const suggestions = this.state.allUsers.filter((user: any) =>
                user.username.toLowerCase().includes(value.toLowerCase())
              );
              this.updateState({
                inputValue: value,
                suggestions,
                showSuggestions: value.length > 0 && suggestions.length > 0,
              });
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
        this.state.showSuggestions
          ? createElement(
              "ul",
              {
                class: [
                  "absolute",
                  "top-[60px]",
                  "left-0",
                  "right-0",
                  "border",
                  "rounded-lg",
                  "shadow-md",
                  "z-10",
                ],
              },
              this.state.suggestions.map((user) => {
                return createElement(
                  "li",
                  {
                    class: ["px-4", "py-2", "cursor-pointer"],
                    on: {
                      click: () => {
                        this.updateState({
                          inputValue: user,
                          suggestions: [],
                          showSuggestions: false,
                        });
                      },
                    },
                  },
                  [user]
                );
              })
            )
          : null,
      ]
    );
  },
});

export default Searchbar;
