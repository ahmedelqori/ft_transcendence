import { createElement, defineComponent } from "../../../uccello/Uccello.js";

const SecondCard = defineComponent<void>({
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
          "mt-[40px]",
          "gap-4",
          "relative",
          "border-[1px]",
          "border-opacity-[30%]",
          "border-[var(--light-grey)]",
        ],
      },
      [
        createElement("img", {
          src: "../../../../public/assets/afanidi.png",
          class: ["rounded-full", "w-[100px]"],
        }),
        createElement("h4", {}, ["afanidi"]),
        createElement("h4", { class: ["text-[var(--light-grey)]"] }, [
          "#Work Harder",
        ]),
        createElement("img", {
          class: ["absolute", "w-[50px]", "top-[90px]", "right-[15px]"],
          src: "../../../../public/assets/MetalMedal.png",
        }),
      ]
    );
  },
});

export default SecondCard;
