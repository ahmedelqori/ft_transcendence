import {
  createElement,
  defineComponent,
  IComponent,
} from "../../../uccello/Uccello.js";

interface FriendItemProps {
  username: string;
}
interface FriendItemState {
  isLoading: boolean;
}

const FriendItem = defineComponent<FriendItemState, FriendItemProps>({
  onMounted(this: IComponent<FriendItemState, FriendItemProps>) {
    setTimeout(() => {
      this.updateState({ isLoading: false });
    }, 2000);
  },
  state() {
    return { isLoading: true };
  },
  render(this: IComponent<FriendItemState, FriendItemProps>) {
    return this.state.isLoading
      ? createElement(
          "div",
          {
            class: [
              "border",
              "w-full",
              "aspect-square",
              "border-2",
              "gap-4",
              "rounded-[30px]",
              "border-[#878787]",
              "border-opacity-[30%]",
              "animate-pulse",
              "flex",
              "flex-col",
              "items-center",
              "justify-center",
              "p-4",
            ],
          },
          [
            createElement("div", {
              class: [
                "bg-[var(--light-grey)]",
                "rounded-full",
                "w-[80px]",
                "h-[80px]",
                "mb-4",
              ],
            }),
            createElement("div", {
              class: [
                "bg-[var(--light-grey)]",
                "bg-opacity-[%30]",
                "rounded-md",
                "h-4",
                "w-3/4",
              ],
            }),
          ]
        )
      : createElement(
          "div",
          {
            class: [
              "border",
              "w-full",
              "aspect-square",
              "items-center",
              "justify-center",
              "border-2",
              "gap-4",
              "rounded-[30px]",
              "border-[#878787]",
              "border-opacity-[30%]",
              "relative",
            ],
          },
          [
            createElement(
              "div",
              { class: ["w-full", "flex", "justify-center"] },
              [
                createElement("img", {
                  src: "../../../public/assets/relhamma.png",
                  class: ["rounded-full", "w-[80px]"],
                }),
              ]
            ),
            createElement("div", { class: ["w-full", "text-center"] }, [
              `@${this.props.username}`,
            ]),
            createElement(
              "div",
              { class: ["w-fit", "bottom-[-1px]", "absolute", "right-[-1px]"] },
              [
                createElement(
                  "div",
                  {
                    class: ["absolute", "w-[50px]", "h-[50px]", "relative"],
                  },
                  [
                    createElement("div", {
                      class: [
                        "cursor-pointer",
                        "absolute",
                        "top-0",
                        "left-0",
                        "h-0",
                        "w-0",
                        "rounded-br-[30px]",
                        "border-t-[50px]",
                        "border-r-[50px]",
                        "border-t-transparent",
                        "border-l-[#ddf247]",
                        "border-[#ddf247]",
                      ],
                    }),
                    createElement(
                      "button",
                      {
                        class: [
                          "absolute",
                          "top-[65%]",
                          "left-[65%]",
                          "-translate-x-1/2",
                          "-translate-y-1/2",
                          "text-black",
                          "text-xl",
                          "font-[42px]",
                          "cursor-pointer",
                          "font-bold",
                        ],
                      },
                      ["-"]
                    ),
                  ]
                ),
              ]
            ),
          ]
        );
  },
});

export default FriendItem;
