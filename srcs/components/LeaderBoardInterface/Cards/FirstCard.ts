import { createElement, defineComponent } from "../../../uccello/Uccello.js";

const FirstCard = defineComponent<void>({
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
          "gap-3",
          "mt-[-20px]",
          "relative",
          "cursor-pointer",
          "border-[1px]",
          "border-opacity-[30%]",
          "border-[var(--light-yellow)]",
          "text-[20px]",
          "hover:scale-[105%]",
          "duration-75",
        ],
      },
      [
        createElement("img", {
          src: "../../../../public/assets/avatar.png",
          class: ["rounded-full", "w-[100px]"],
        }),
        createElement("h4", {}, ["sajaite"]),
        createElement("h4", { class: ["text-[var(--light-grey)]"] }, [
          "#Work Harder",
        ]),
        createElement("img", {
          class: ["absolute", "w-[50px]", "top-[90px]", "right-[24px]"],
          src: "../../../../public/assets/GoldenMedal.png",
        }),
      ]
    );
  },
});

export default FirstCard;
