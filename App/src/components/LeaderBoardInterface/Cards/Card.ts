import {
  createElement,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";

interface CardProps {
  id: number;
  xp: number;
  username: string;
  avatar: string;
  index: number;
}

const Card = defineComponent<void, CardProps>({
  render(this: IComponent<void, CardProps>) {
    return createElement(
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
              src: this.props.avatar,
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
                [this.props.username]
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
                [this.props.xp + " pts"]
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
          [`${this.props.index}`]
        ),
      ]
    );
  },
});

export default Card;
