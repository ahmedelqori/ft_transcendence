import { createElement, defineComponent } from "../../../../uccello/Uccello.js";

const FriendInfoBar = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "div",
      { class: ["flex-row", "w-full", "justify-between"] },
      [
        createElement("div", {}, [
          createElement("div", { class: ["gap-1", "items-start"] }, [
            createElement("div", { class: ["text-2xl"] }, ["Afanidi"]),
            createElement("div", { class: ["text-[#878787]"] }, ["online"]),
          ]),
        ]),
        createElement("div", { class: ["flex-row"] }, [
          createElement(
            "button",
            {
              class: [
                "px-8",
                "py-2",
                "border-[2px]",
                "items-center",
                "border-white",
                "rounded-[20px]",
                "hover:border-[#ddf247]",
                "hover:text-[#ddf247]",
              ],
            },
            [
              createElement("div", { class: ["flex-row", "gap-2"] }, [
                createElement("i", { class: ["ph", "ph-play"] }),
                "Let's play",
              ]),
            ]
          ),
          createElement("i", {
            class: ["ph", "ph-dots-three-vertical", "text-5xl"],
          }),
        ]),
      ]
    );
  },
});

export default FriendInfoBar;
