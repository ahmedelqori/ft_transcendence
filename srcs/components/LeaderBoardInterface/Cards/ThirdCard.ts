import { createElement, defineComponent } from "../../../uccello/Uccello.js";

const ThirdCard = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "div",
      {
        class: [
          "w-fit",
          "h-fit",
          "rounded-[20px]",
          "px-[30px]",
          "py-[20px]",
          "gap-4",
          "mt-[60px]",
          "rounded-[20px]",
          "border-[1px]",
          "border-opacity-[30%]",
          "border-[var(--light-grey)]",
          "relative",
        ],
      },
      [
        createElement("img", {
          src: "../../../../public/assets/avatar.png",
          class: ["rounded-full", "w-[100px]"],
        }),
        createElement("h4", {}, ["ael-qori"]),
        createElement("h4", { class: ["text-[var(--light-grey)]"] }, [
          "#Work Harder",
        ]),
        createElement("img", {
          class: ["absolute", "w-[50px]", "top-[90px]", "right-[15px]"],
          src: "../../../../public/assets/BronzeMedal.png",
        }),
      ]
    );
  },
});

export default ThirdCard;
