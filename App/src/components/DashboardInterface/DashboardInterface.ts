import { authState } from "@/Hooks/Auth";
import enhancedFetch from "@/Hooks/fetch";
import {
  createElement,
  createFragment,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";
import FriendsSideBar from "./FriendsSideBar";
import Loader from "../Loader/Loader";

interface IDashboardInterface {
  friends: any[];
  hoverCards: any[];
  showFriend: boolean;
  loadingFriends: boolean;
}

const DashboardInterface = defineComponent<IDashboardInterface>({
  async onMounted(
    this: IComponent<IDashboardInterface> & {
      handleGetFriends: () => Promise<void>;
    }
  ) {
    await this.handleGetFriends();
  },
  state() {
    return {
      showFriend: false,
      hoverCards: [0, 0, 0],
      friends: [],
      loadingFriends: true,
    };
  },

  render(
    this: IComponent<IDashboardInterface> & { sendInvite: () => Promise<void> }
  ) {
    return createElement(
      "section",
      {
        class: [
          "flex",
          "z-10",
          "gap-4",
          "w-full",
          "relative",
          "py-8",
          "px-6",
          "max-lg:py-4",
          "h-[75vh]",
          "max-lg:h-full",
          "my-auto",
        ],
        style: {},
      },
      [
        createElement(
          "div",
          {
            class: ["w-full", "h-full", "bg-no-repeat", "rounded-[30px]"],
            style: {
              "background-position": "center",
            },
          },
          [
            createElement(
              "div",
              {
                class: [
                  "w-full",
                  "h-full",
                  "flex-row",
                  "gap-5",
                  "justify-between",
                ],
              },
              [
                createElement(
                  "div",
                  {
                    class: ["w-[50%]", "h-full", "bg-black", "rounded-[30px]"],
                  },
                  ["ProfileInfo"]
                ),
                createElement(
                  "div",
                  {
                    class: [
                      "w-full",
                      "h-full",
                      "rounded-[30px]",
                      "flex-row",
                      "relative",
                    ],
                  },
                  [
                    createElement(
                      "div",
                      {
                        style: {
                          "clip-path": "polygon(0 0, 95% 0, 85% 100%, 0% 100%)",
                        },
                        class: [
                          "w-2/5",
                          "h-full",
                          "absolute",
                          "top-0",
                          "left-0",
                          "rounded-tl-[30px]",
                          "rounded-bl-[30px]",
                          "border-2",
                          "border-[#878787]",
                          "border-opacity-[30%]",
                          "cursor-pointer",
                          this.state.hoverCards[0] ||
                          this.state.hoverCards.indexOf(1) === -1
                            ? "blur-none"
                            : "blur-sm",
                        ],
                        on: {
                          mouseenter: () => {
                            this.updateState({ hoverCards: [1, 0, 0] });
                          },
                          mouseleave: () => {
                            this.updateState({ hoverCards: [0, 0, 0] });
                          },
                        },
                      },
                      []
                    ),
                    createElement(
                      "div",
                      {
                        style: {
                          "clip-path":
                            "polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)",
                          transform: "translate(-50%, -50%)",
                        },
                        class: [
                          "w-1/5",
                          "h-full",
                          "absolute",
                          "top-[50%]",
                          "left-[50%]",
                          "border-2",
                          "border-[#878787]",
                          "border-opacity-[30%]",
                          "cursor-pointer",
                          this.state.hoverCards[1] ||
                          this.state.hoverCards.indexOf(1) === -1
                            ? "blur-none"
                            : "blur-sm",
                          "relative",
                        ],
                        on: {
                          mouseenter: () => {
                            this.updateState({ hoverCards: [0, 1, 0] });
                          },
                          mouseleave: () => {
                            this.updateState({ hoverCards: [0, 0, 0] });
                          },
                        },
                      },
                      []
                    ),
                    createElement(
                      "div",
                      {
                        style: {
                          "clip-path":
                            " polygon(15% 0, 100% 0, 100% 100%, 5% 100%)",
                        },
                        class: [
                          "w-2/5",
                          "h-full",
                          "absolute",
                          "right-0",
                          "rounded-tr-[30px]",
                          "rounded-br-[30px]",
                          "border-2",
                          "border-[#878787]",
                          "border-opacity-[30%]",
                          "cursor-pointer",
                          this.state.hoverCards[2] ||
                          this.state.hoverCards.indexOf(1) === -1
                            ? "blur-none"
                            : "blur-sm",
                        ],
                        on: {
                          mouseenter: () => {
                            this.updateState({ hoverCards: [0, 0, 1] });
                          },
                          mouseleave: () => {
                            this.updateState({ hoverCards: [0, 0, 0] });
                          },
                        },
                      },
                      []
                    ),
                  ]
                ),
              ]
            ),
            createElement("div", { class: ["w-full", "h-full"] }, []),
          ]
        ),
        createElement(
          "div",
          {
            class: [
              this.state.showFriend ? "w-[35%]" : "w-[150px]",
              "border-2",
              "border-opacity-[30%]",
              "h-fit",
              "max-h-full",
              "rounded-[30px]",
              "border-[#878787]",
              "border-opacity-[30%]",
              "py-8",
              "px-6",
              "transition-all",
              "duration-[1s]",
              "ease-in-out",
            ],
            on: {
              mouseenter: (e) => {
                this.updateState({ showFriend: true });
              },
              mouseleave: (e) => {
                this.updateState({ showFriend: false });
              },
            },
          },
          [
            createElement(
              "div",
              {
                class: [
                  "w-full",
                  "h-full",
                  this.state.showFriend ? "items-start" : "items-center",
                  "gap-4",
                  "overflow-y-auto",
                  "overflow-x-hidden",
                  "[&::-webkit-scrollbar]:hidden",
                  "[-ms-overflow-style:none]",
                  "[scrollbar-width:none]",
                ],
              },
              this.state.loadingFriends
                ? [createElement(Loader)]
                : this.state.friends.map((e: any) =>
                    createElement(FriendsSideBar, {
                      id: e.id,
                      avatar: e.avatar_url,
                      username: e.username,
                      showFriend: this.state.showFriend,
                      firstname: e.first_name,
                      lastname: e.last_name,
                    })
                  )
            ),
          ]
        ),
      ]
    );
  },
  async handleGetFriends(this: IComponent<IDashboardInterface>) {
    try {
      const res = await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/friends/`
      );
      const data = await res.json();
      setTimeout(() => {
        if (this.getIsMounted)
          this.updateState({ friends: data, loadingFriends: false });
      }, 500);
    } catch (err) {
      console.log(err);
    }
  },
});

export default DashboardInterface;
