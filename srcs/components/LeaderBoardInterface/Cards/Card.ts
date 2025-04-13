import { createElement, defineComponent } from "../../../uccello/Uccello.js";

const Card = defineComponent<void>({
  state() {},
  render() {
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
        ],
      },
      [
        createElement("div", { class: ["flex-row", "gap-4"] }, [
          createElement("img", {
            src: "../../../../public/assets/avatar.png",
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
              ["#Never_Give_UP"]
            ),
          ]),
        ]),
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
