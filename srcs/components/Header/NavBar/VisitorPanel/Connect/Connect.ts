import { router } from "../../../../../router/Router.js";
import {
  createElement,
  defineComponent,
} from "../../../../../uccello/Uccello.js";
const Connect = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "div",
      {
        class: [
          "z-10",
          "px-6",
          "py-2",
          "gap-2",
          "text-lg",
          "flex-row",
          "rounded-xl",
          "font-medium",
          "text-black",
          "cursor-pointer",
          "bg-[var(--main-color)]",
        ],
        on: {
          click: () => {
            router.navigateTo("/login");
          },
        },
      },
      [
        createElement("button", {}, ["Connect"]),
        createElement(
          "i",
          { class: ["ph", "ph-arrow-up-right", "text-lg", "font-bold"] },
          []
        ),
      ]
    );
  },
});

export default Connect;
