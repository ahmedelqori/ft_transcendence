import {
  createElement,
  defineComponent,
  IComponent,
} from "../../../../uccello/Uccello.js";

interface FriendProps {
  username: string;
  setOption: (str: string) => void;
  setUser: (str: string) => void;
}

interface FriendState {
  xPosition: number;
  yPosition: number;
  showContextMenu: boolean;
}

const Friend = defineComponent<FriendState, FriendProps>({
  onMounted(
    this: IComponent<FriendState> & {
      handleClickOutSide: (e: MouseEvent) => void;
    }
  ) {
    this.handleClickOutSide = this.handleClickOutSide.bind(this);
    document.addEventListener("mousedown", this.handleClickOutSide);
  },
  state() {
    return {
      xPosition: 0,
      yPosition: 0,
      showContextMenu: false,
    };
  },
  render(this: IComponent<FriendState, FriendProps>) {
    return createElement(
      "div",
      {
        class: [
          "w-[100%]",
          "h-[70px]",
          "flex-row",
          "justify-between",
          "text-[#878787]",
          "hover:bg-[#878787]",
          "hover:bg-opacity-[10%]",
          "p-2",
          "rounded-[14px]",
          "border-2",
          "border-transparent",
          "focus:border-[#828c3a]",
          "cursor-pointer",
          "relative",
        ],
        on: {
          contextmenu: (e) => {
            e.preventDefault();
            this.updateState({
              showContextMenu: true,
              xPosition: e.pageX,
              yPosition: e.pageY,
            });
          },
        },
      },
      [
        createElement("div", { class: ["flex-row", "gap-3", "z-20"] }, [
          createElement("img", {
            src: "../../../../../../public/assets/afanidi.png",
            class: ["w-[60px]", "h-[60px]", "rounded-[50%]"],
          }),
          createElement("div", { class: "items-start" }, [
            createElement("p", { class: ["text-white"] }, [
              this.props.username,
            ]),
            createElement("p", { class: ["text-sm"] }, [
              "Rally your way to victory!",
            ]),
          ]),
        ]),
        createElement("div", {}, ["5m"]),
        createElement(
          "div",
          {
            class: [
              this.state.showContextMenu ? "block" : "hidden",
              "z-30",
              "absolute",
              "w-[170px]",
              "bg-[var(--background-color)]",
              "rounded-[14px]",
              "py-4",
              "px-5",
              "flex",
              "flex-col",
              "items-start",
              "gap-3",
            ],
            style: {
              top: `${this.state.yPosition}px`,
              left: `${this.state.xPosition}px`,
              position: "fixed",
            },
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
                  "w-full",
                ],
                on: {
                  click: () => {
                    this.props.setOption("vprofile");
                    this.props.setUser(this.props.username);
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
                  "w-full",
                ],
                on: {
                  click: () => {
                    this.props.setOption("unfriend");
                    this.props.setUser(this.props.username);
                  },
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
                  "w-full",
                ],
                on: {
                  click: () => {
                    this.props.setOption("block");
                    this.props.setUser(this.props.username);
                  },
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
      ]
    );
  },
  handleClickOutSide(this: IComponent<FriendState>, e: MouseEvent) {
    if (!this.state) {
      console.error("Component state is undefined");
      return;
    }
    if (this.state.showContextMenu) {
      const element = this.getHtmlElement;
      if (element && !element.contains(e.target as Node)) {
        this.updateState({
          showContextMenu: false,
        });
      }
    }
  },
});

export default Friend;
