import {
  createElement,
  type IComponent,
  defineComponent,
} from "@/uccello/Uccello.js";
import FriendItem from "./FriendItem.js";
import enhancedFetch from "@/Hooks/fetch.js";
import Loader from "../Loader/Loader.js";

interface FriendsInterfaceState {
  friends: (string | null)[];
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
}

const FriendsInterface = defineComponent<FriendsInterfaceState>({
  async onMounted(this: IComponent<FriendsInterfaceState>) {
    try {
      const res = await enhancedFetch.fetch(
        "https://www.meedivo.me/api/friends/"
      );
      const data = await res.json();
      if (this.getIsMounted)
        this.updateState({ friends: data, isLoading: false });
    } catch (err) {
      console.log(err);
    }
    if (this.getIsMounted)
      this.updateState({
        totalPages: Math.ceil(this.state.friends.length / 9),
      });
  },
  state() {
    return {
      friends: [],
      currentPage: 0,
      totalPages: 1,
      isLoading: true,
    };
  },

  render(
    this: IComponent<FriendsInterfaceState> & {
      goToPage: (index: number) => void;
      handleScroll: (event: Event) => void;
    }
  ) {
    const pages = [];
    for (let i = 0; i < this.state.friends.length; i += 9) {
      pages.push(this.state.friends.slice(i, i + 9));
    }

    return this.state.isLoading
      ? createElement(Loader)
      : createElement(
          "section",
          {
            class: [
              "w-[90%]",
              "h-[720px]",
              "max-h-[720px]",
              "m-0",
              "p-0",
              "relative",
            ],
          },
          [
            createElement(
              "div",
              {
                class: [
                  "friends-container",
                  "w-full",
                  "h-full",
                  "max-h-[720px]",
                  "overflow-x-auto",
                  "flex",
                  "snap-x",
                  "snap-mandatory",
                  "scrollbar-hide",
                  "overflow-scroll",
                  "overflow-x-hidden",
                  "[&::-webkit-scrollbar]:w-1",
                  "pr-2",
                  "[&::-webkit-scrollbar-track]:rounded-full",
                  "[&::-webkit-scrollbar-track]:bg-gray-100",
                  "[&::-webkit-scrollbar-thumb]:rounded-full",
                  "[&::-webkit-scrollbar-thumb]:bg-gray-300",
                  "dark:[&::-webkit-scrollbar-track]:bg-transparent",
                  "dark:[&::-webkit-scrollbar-thumb]:bg-[#ddf247]",
                  "dark:[&::-webkit-scrollbar-thumb]:bg-opacity-[70%]",
                ],
                onScroll: this.handleScroll,
              },
              pages.length === 0
                ? [
                    createElement(
                      "div",
                      {
                        class: [
                          "flex",
                          "flex-col",
                          "items-center",
                          "gap-2",
                          "my-auto",
                        ],
                      },
                      [
                        createElement(
                          "span",
                          { class: ["text-gray-500", "text-lg", "italic"] },
                          ["No friends yet"]
                        ),
                      ]
                    ),
                  ]
                : pages.map((pageUsers) =>
                    createElement(
                      "div",
                      {
                        class: [
                          "grid",
                          "grid-cols-3",
                          "grid-rows-3",
                          "gap-4",
                          "w-full",
                          "h-full",
                          "flex-shrink-0",
                          "snap-center",
                        ],
                      },
                      pageUsers.map((e: any) =>
                        createElement(FriendItem, {
                          username: e.username,
                          avatar: e.avatar_url,
                          id: e.id,
                        })
                      )
                    )
                  )
            ),
            createElement("div", {
              class: [
                "absolute",
                "bottom-4",
                "left-1/2",
                "transform",
                "-translate-x-1/2",
                "flex",
                "space-x-2",
                "z-10",
              ],
            }),
          ]
        );
  },
  goToPage(this: IComponent<FriendsInterfaceState>, pageIndex: number) {
    if (pageIndex >= 0 && pageIndex < this.state.totalPages) {
      const container = document.querySelector(".friends-container");
      if (container) {
        container.scrollTo({
          left: pageIndex * container.clientWidth,
          behavior: "smooth",
        });

        this.updateState({
          currentPage: pageIndex,
        });
      }
    }
  },
  handleScroll(this: IComponent<FriendsInterfaceState>, event: Event) {
    const container = event.target as HTMLElement;
    if (container) {
      const pageWidth = container.clientWidth;
      const scrollPosition = container.scrollLeft;
      const newPage = Math.round(scrollPosition / pageWidth);

      if (newPage !== this.state.currentPage) {
        this.updateState({
          currentPage: newPage,
        });
      }
    }
  },
});

export default FriendsInterface;
