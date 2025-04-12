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
          "w-fit",
          "px-[20px]",
          "py-[10px]",
          "gap-[40px]",
        ],
      },
      [
        createElement("img", {
          src: "../../../../public/assets/avatar.png",
          class: ["w-[40px]", "rounded-full"],
        }),
        createElement("div", {}, [
          createElement("h4", {}, ["ael-qori"]),
          createElement("p", { class: ["text-[var(--light-grey)]"] }, [
            "#Never_Give_UP",
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
