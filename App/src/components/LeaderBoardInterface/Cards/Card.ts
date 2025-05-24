import {
  createElement,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";

interface CardState {
  isLoading: boolean;
}

const Card = defineComponent<CardState>({
  state() {
    return { isLoading: true };
  },
  onMounted(this: IComponent<CardState>) {
    // setTimeout(() => {
    //   this.updateState({ isLoading: false });
    // }, 3000);
  },
  render(this: IComponent<CardState>) {
    return this.state.isLoading
      ? createElement(
          "div",
          {
            class: [
              "w-full",
              "w-[400px]",
              "max-w-[400px]",
              "px-[20px]",
              "py-[10px]",
              "gap-[40px]",
              "rounded-[20px]",
              "border-[1px]",
              "border-opacity-[30%]",
              "border-[var(--light-grey)]",
              "animate-pulse",
              "flex",
              "flex-row",
              "items-center",
            ],
          },
          [
            createElement("div", {
              class: ["w-[40px]", "h-[40px]", "bg-gray-300", "rounded-full"],
            }),
            createElement(
              "div",
              {
                class: [
                  "flex",
                  "flex-col",
                  "gap-2",
                  "flex-grow",
                  "items-start",
                ],
              },
              [
                createElement("div", {
                  class: ["bg-gray-300", "h-[16px]", "w-[100px]", "rounded-md"],
                }),
                createElement("div", {
                  class: ["bg-gray-300", "h-[14px]", "w-[60px]", "rounded-md"],
                }),
              ]
            ),
            createElement("div", {
              class: ["bg-gray-300", "rounded-full", "w-[32px]", "h-[24px]"],
            }),
          ]
        )
      : createElement(
          "div",
          {
            class: [
              "w-full",
              "flex-row",
              "border-[1px]",
              "border-opacity-[30%]",
              "border-[var(--light-grey)]",
              "rounded-[20px]",
              "w-[400px]",
              "max-w-[400px]",
              "px-[20px]",
              "py-[10px]",
              "gap-[40px]",
              "cursor-pointer",
              "hover:scale-[101%]",
              "duration-75",
              "flex",
              "items-center",
            ],
          },
          [
            createElement(
              "div",
              { class: ["flex-row", "gap-4", "flex", "items-center"] },
              [
                createElement("img", {
                  src: "assets/avatar.png",
                  class: ["w-[40px]", "rounded-full"],
                }),
                createElement("div", { class: ["mr-[40px]", "items-start"] }, [
                  createElement(
                    "h4",
                    {
                      class: [
                        "text-[20px]",
                        "opacity-[80%]",
                        "truncate",
                        "max-w-[200px]",
                      ],
                    },
                    ["afanidi"]
                  ),
                  createElement(
                    "p",
                    {
                      class: [
                        "text-[var(--light-grey)]",
                        "text-[16px]",
                        "text-ellipsis",
                      ],
                    },
                    ["845 pts"]
                  ),
                ]),
              ]
            ),
            createElement(
              "span",
              {
                class: [
                  "text-[var(--light-yellow)]",
                  "border-[1px]",
                  "border-[var(--light-yellow)]",
                  "rounded-full",
                  "px-[8px]",
                  "py-[2px]",
                ],
              },
              ["4"]
            ),
          ]
        );
  },
});

export default Card;
