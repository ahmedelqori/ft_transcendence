import { createElement, defineComponent } from "../../../../uccello/Uccello.js";

const Friend = defineComponent<void>({
  state() {},
  render() {
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
        ],
      },
      [
        createElement("div", { class: ["flex-row", "gap-3", "z-20"] }, [
          createElement("img", {
            src: "../../../../../../public/assets/afanidi.png",
            class: ["w-[60px]", "h-[60px]", "rounded-[50%]"],
          }),
          createElement("div", { class: "items-start" }, [
            createElement("p", { class: ["text-white"] }, ["afanidi"]),
            createElement("p", { class: ["text-sm"] }, [
              "Rally your way to victory!",
            ]),
          ]),
        ]),
        createElement("div", {}, ["5m"]),
      ]
    );
  },
});

export default Friend;
