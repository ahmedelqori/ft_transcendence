import enhancedFetch from "@/Hooks/fetch";
import { router } from "@/router/Router.js";
import {
  createElement,
  defineComponent,
  eventBus,
  type IComponent,
} from "@/uccello/Uccello.js";

interface FriendInfoBarProps {
  username: string;
  online: boolean;
  isLoading: boolean;
  friendId: number;
}

interface FriendInfoBarState {
  showOptions: boolean;
  isOnline: boolean;
}

const FriendInfoBar = defineComponent<FriendInfoBarState, FriendInfoBarProps>({
  onMounted(
    this: IComponent<FriendInfoBarState, FriendInfoBarProps> & {
      handleClickOutSide: (e: MouseEvent) => void;
    }
  ) {
    this.handleClickOutSide = this.handleClickOutSide.bind(this);
    document.addEventListener("mousedown", this.handleClickOutSide);
  },
  state() {
    return { showOptions: false, isOnline: true };
  },
  render(
    this: IComponent<FriendInfoBarState, FriendInfoBarProps> & {
      handleUnfriendButton: () => Promise<void>;
      handleBlockButton: () => Promise<void>;
      handlePlayButton: () => Promise<void>;
    }
  ) {
    return createElement(
      "div",
      { class: ["flex-row", "w-full", "justify-between"] },
      [
        createElement("div", {}, [
          createElement("div", { class: ["gap-1", "items-start"] }, [
            createElement("div", { class: ["text-2xl", "max-lg:text-base"] }, [
              this.props.username,
            ]),
            createElement(
              "div",
              {
                class: [
                  "text-[#878787]",
                  "max-lg:text-xs",
                  this.props.isLoading
                    ? "text-[#FF9F00]"
                    : this.props.online
                    ? "text-[var(--light-yellow)]"
                    : "text-[var(--light-grey)]",
                  "relative",
                ],
              },
              [
                this.props.isLoading
                  ? "Waiting"
                  : this.props.online
                  ? "Online"
                  : "Offline",
                createElement("div", {
                  class: [
                    "absolute",
                    "w-3",
                    "h-3",
                    this.props.isLoading
                      ? "bg-[#FF9F00]"
                      : this.props.online
                      ? "bg-[var(--light-yellow)]"
                      : "bg-[var(--light-grey)]",
                    "right-[-20px]",
                    "top-[6px]",
                    "max-lg:top-0",
                    "rounded-full",
                  ],
                }),
              ]
            ),
          ]),
        ]),
        createElement("div", { class: ["flex-row", "relative"] }, [
          createElement(
            "button",
            {
              class: [
                "px-8",
                "py-2",
                "max-lg:px-3",
                "max-lg:py-1",
                "border-[2px]",
                "items-center",
                "border-white",
                "rounded-[20px]",
                "hover:border-[#ddf247]",
                "hover:text-[#ddf247]",
              ],
              on: {
                click: () => this.handlePlayButton(),
              },
            },
            [
              createElement(
                "div",
                { class: ["flex-row", "gap-2", "max-lg:text-xs"] },
                [createElement("i", { class: ["ph", "ph-play"] }), "Let's play"]
              ),
            ]
          ),
          createElement("i", {
            class: ["ph", "ph-dots-three-vertical", "text-5xl"],
            on: {
              click: () => {
                this.updateState({ showOptions: !this.state.showOptions });
              },
            },
          }),
          createElement(
            "div",
            {
              class: [
                this.state.showOptions ? "block" : "hidden",
                "absolute",
                "w-[170px]",
                "h-[140px]",
                "bg-[var(--background-color)]",
                "rounded-[14px]",
                "py-4",
                "px-5",
                "top-[60px]",
                "flex",
                "items-start",
                "gap-3",
              ],
            },
            [
              createElement(
                "div",
                {
                  class: [
                    "text-[14px]",
                    "flex",
                    "flex-row",
                    "gap-4",
                    "hover:text-[var(--light-yellow)]",
                  ],
                  on: {
                    click: async () => {
                      await router.navigateTo(
                        `/profile/${this.props.username}`
                      );
                      eventBus.emit("change:profile");
                    },
                  },
                },
                [
                  createElement("i", {
                    class: ["ph", "ph-user-circle", "text-[18px]"],
                  }),
                  createElement("button", {}, ["View Profile"]),
                ]
              ),
              createElement(
                "div",
                {
                  class: [
                    "text-[14px]",
                    "flex",
                    "flex-row",
                    "gap-4",
                    "hover:text-[var(--light-yellow)]",
                  ],
                  on: {
                    click: () => this.handleUnfriendButton(),
                  },
                },

                [
                  createElement("i", {
                    class: ["ph", "ph-user-circle-minus", "text-[18px]"],
                  }),
                  createElement("button", {}, ["Unfriend"]),
                ]
              ),
              createElement(
                "div",
                {
                  class: [
                    "text-[14px]",
                    "flex",
                    "flex-row",
                    "gap-4",
                    "text-[var(--red-color)]",
                  ],
                  on: {
                    click: () => this.handleBlockButton(),
                  },
                },
                [
                  createElement("i", {
                    class: ["ph", "ph-prohibit", "text-[18px]"],
                  }),
                  createElement("button", {}, ["Block User"]),
                ]
              ),
            ]
          ),
        ]),
      ]
    );
  },
  handleClickOutSide(this: IComponent<FriendInfoBarState>, e: MouseEvent) {
    if (!this.state) {
      console.error("Component state is undefined");
      return;
    }
    if (this.state.showOptions) {
      const element = this.getHtmlElement;
      if (element && !element.contains(e.target as Node)) {
        this.updateState({
          showOptions: false,
        });
      }
    }
  },
  async handleUnfriendButton(
    this: IComponent<FriendInfoBarState, FriendInfoBarProps>
  ) {
    try {
      await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/friends/${
          this.props.friendId
        }/friend`,
        {
          method: "DELETE",
        }
      );
      eventBus.emit("update:friends");
      eventBus.emit("remove:friend");
    } catch (err) {}
  },
  async handleBlockButton(
    this: IComponent<FriendInfoBarState, FriendInfoBarProps>
  ) {
    try {
      await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/friends/${
          this.props.friendId
        }/block`,
        {
          method: "POST",
        }
      );
      eventBus.emit("update:friends");
      eventBus.emit("remove:friend");
    } catch (err) {}
  },
  async handlePlayButton(
    this: IComponent<FriendInfoBarState, FriendInfoBarProps>
  ) {
    try {
      await enhancedFetch.fetch(`${import.meta.env.VITE_URL_DEV}/api/games/`, {
      // await enhancedFetch.fetch(`http://localhost:3000/`, {
        method: "POST",
        body: JSON.stringify({ playerTwoId: this.props.friendId }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.log(err);
    }
  },
});

export default FriendInfoBar;
