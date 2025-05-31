import { router } from "@/router/Router.js";
import enhancedFetch from "@/Hooks/fetch.js";
import {
  createElement,
  defineComponent,
  eventBus,
  type IComponent,
} from "@/uccello/Uccello.js";
import { authState } from "@/Hooks/Auth";

interface User {
  username: string;
  avatar_url: string;
  first_name: string;
  last_name: string;
  id: number;
}

interface SearchBarState {
  inputValue: string;
  suggestions: User[];
  showSuggestions: boolean;
  offset: number;
  hasMoreResults: boolean;
  isLoading: boolean;
  totalResults: number;
}

const USERS_PER_PAGE = 3;

const Searchbar = defineComponent<SearchBarState>({
  state() {
    return {
      inputValue: "",
      suggestions: [],
      showSuggestions: false,
      offset: 0,
      hasMoreResults: false,
      isLoading: false,
      totalResults: 0,
    };
  },

  async fetchUsers(
    this: IComponent<SearchBarState>,
    query: string,
    resetResults: boolean = true
  ) {
    if (query.trim().length === 0) {
      this.updateState({
        suggestions: [],
        showSuggestions: false,
        offset: 0,
        hasMoreResults: false,
        totalResults: 0,
      });
      return;
    }

    const offset = resetResults ? 0 : this.state.offset;

    this.updateState({ isLoading: true });

    try {
      const url = `${
        import.meta.env.VITE_URL_DEV
      }/api/account/search/?q=${encodeURIComponent(
        query
      )}&limit=${USERS_PER_PAGE}&offset=${offset}`;
      const res = await enhancedFetch.fetch(url);
      const data = await res.json();
      const suggestions = resetResults
        ? data.result || []
        : [...this.state.suggestions, ...(data.result || [])];
      const totalResults = data.count || 0;
      const newOffset = offset + (data.result?.length || 0);
      const hasMoreResults = newOffset < totalResults;
      this.updateState({
        suggestions,
        offset: newOffset,
        hasMoreResults,
        showSuggestions: suggestions.length > 0,
        totalResults,
        isLoading: false,
      });
    } catch (err) {
      this.updateState({ isLoading: false });
    }
  },

  loadMoreUsers(
    this: IComponent<SearchBarState> & {
      fetchUsers: (a: string, b?: boolean) => void;
    }
  ) {
    if (this.state.hasMoreResults && !this.state.isLoading) {
      this.fetchUsers(this.state.inputValue, false);
    }
  },

  render(
    this: IComponent<SearchBarState> & {
      fetchUsers: (a: string, b?: boolean) => void;
      loadMoreUsers: () => void;
    }
  ) {
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
          "z-20",
        ],
      },
      [
        createElement("input", {
          value: this.state.inputValue,
          placeholder: "Search users...",
          on: {
            input: async ({ target }: { target: HTMLInputElement }) => {
              const value = target.value;
              this.updateState({ inputValue: value });
              this.fetchUsers(value);
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
                  "rounded-lg",
                  "shadow-md",
                  "z-10",
                  "bg-[var(--background-color)]",
                ],
              },
              [
                ...this.state.suggestions.map((user: User) => {
                  if (user.id == authState.getState().user?.id) return null;
                  return createElement(
                    "li",
                    {
                      class: [
                        "px-4",
                        "py-2",
                        "cursor-pointer",
                        "flex",
                        "gap-5",
                        "items-center",
                        "flex",
                      ],
                      on: {
                        click: () => {
                          this.updateState({
                            suggestions: [],
                            showSuggestions: false,
                            offset: 0,
                            hasMoreResults: false,
                            totalResults: 0,
                            inputValue: "",
                          });
                        },
                      },
                    },
                    [
                      createElement(
                        "div",
                        {
                          class: [
                            "flex-row",
                            "gap-5",
                            "flex-1",
                            "justify-start",
                          ],
                          on: {
                            click: async () => {
                              this.updateState({
                                inputValue: "",
                                suggestions: [],
                                showSuggestions: false,
                              });
                              await router.navigateTo(
                                `/profile/${user.username}`
                              );
                              eventBus.emit("change:profile");
                            },
                          },
                        },
                        [
                          createElement("img", {
                            src: user.avatar_url,
                            class: ["w-12", "h-12", "rounded-full"],
                          }),
                          createElement("div", { class: ["items-start"] }, [
                            createElement("div", {}, [user.username]),
                            createElement(
                              "div",
                              {
                                class: ["text-[var(--light-grey)]", "text-md"],
                              },
                              [user.first_name + " " + user.last_name]
                            ),
                          ]),
                        ]
                      ),
                      createElement(
                        "div",
                        {
                          class: ["ml-auto"],
                          on: {
                            click: async () => {
                              await enhancedFetch.fetch(
                                `${import.meta.env.VITE_URL_DEV}/api/friends/${
                                  user.id
                                }/request`,
                                {
                                  method: "POST",
                                }
                              );
                            },
                          },
                        },
                        [
                          createElement("i", {
                            class: ["ph", "text-2xl", "ph-user-circle-plus"],
                          }),
                        ]
                      ),
                    ]
                  );
                }),
                this.state.hasMoreResults
                  ? createElement(
                      "li",
                      {
                        class: [
                          "px-4",
                          "py-3",
                          "text-center",
                          "cursor-pointer",
                          "border-t",
                          "border-gray-200",
                          "hover:bg-gray-100",
                        ],
                        on: {
                          click: () => this.loadMoreUsers(),
                        },
                      },
                      [
                        this.state.isLoading
                          ? "Loading..."
                          : `Load more (${this.state.suggestions.length}/${this.state.totalResults})`,
                      ]
                    )
                  : null,
              ]
            )
          : null,
      ]
    );
  },
});

export default Searchbar;
