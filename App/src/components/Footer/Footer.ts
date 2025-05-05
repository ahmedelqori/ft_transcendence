import { createElement, defineComponent } from "@/uccello/Uccello.js";

const Footer = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "div",
      {
        class: ["w-full", "flex", "flex-row", "mb-10"],
      },
      [
        createElement("h4", { class: ["text-[var(--light-grey)]"] }, [
          "@2025 opeN9",
        ]),
        createElement(
          "div",
          { class: ["flex-row", "gap-2", "cursor-pointer"] },
          [
            createElement("button", {}, ["Explore"]),
            createElement(
              "i",
              { class: ["ph", "ph-arrow-up-right", "text-lg", "font-bold"] },
              []
            ),
          ]
        ),
      ]
    );
  },
});

export default Footer;
