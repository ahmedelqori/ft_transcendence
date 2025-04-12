import {
  createElement,
  defineComponent,
  IComponent,
} from "../../../../uccello/Uccello.js";

interface FriendInfoBarState {
  showOptions: boolean;
  isOnline: boolean;
}

const FriendInfoBar = defineComponent<FriendInfoBarState>({
  onMounted(
    this: IComponent<FriendInfoBarState> & {
      handleClickOutSide: (e: MouseEvent) => void;
    }
  ) {
    this.handleClickOutSide = this.handleClickOutSide.bind(this);
    document.addEventListener("mousedown", this.handleClickOutSide);
  },
  state() {
    return { showOptions: false, isOnline: true };
  },
  render(this: IComponent<FriendInfoBarState>) {
    return createElement(
      "div",
      { class: ["flex-row", "w-full", "justify-between"] },
      [
        createElement("div", {}, [
          createElement("div", { class: ["gap-1", "items-start"] }, [
            createElement("div", { class: ["text-2xl"] }, ["Afanidi"]),
            createElement(
              "div",
              {
                class: [
                  "text-[#878787]",
                  this.state.isOnline
                    ? "text-[var(--light-yellow)]"
                    : "text-[var(--light-grey)]",
                  "relative",
                ],
              },
              [
                this.state.isOnline ? "Online" : "Offline",
                createElement("div", {
                  class: [
                    "absolute",
                    "w-3",
                    "h-3",
                    this.state.isOnline
                      ? "bg-[var(--light-yellow)]"
                      : "bg-[var(--light-grey)]",
                    "right-[-20px]",
                    "top-[6px]",
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
                "border-[2px]",
                "items-center",
                "border-white",
                "rounded-[20px]",
                "hover:border-[#ddf247]",
                "hover:text-[#ddf247]",
              ],
            },
            [
              createElement("div", { class: ["flex-row", "gap-2"] }, [
                createElement("i", { class: ["ph", "ph-play"] }),
                "Let's play",
              ]),
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
});

export default FriendInfoBar;
