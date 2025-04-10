import { createElement, defineComponent } from "../../uccello/Uccello.js";
import NavigationBar from "./NavigationBar/NavigationBar.js";

const SideBar = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "aside",
      {
        class: [
          "w-full",
          "h-full",
          "flex",
          "flex-col",
          "justify-around",
          "items-start",
        ],
      },
      [
        createElement("hr", {
          class: ["w-[260px]", "text-[4px]", "border-[#878787]"],
        }),
        createElement(NavigationBar, { class: ["w-full"] }),
        createElement("hr", {
          class: ["w-[260px]", "text-[4px]", "border-[#878787]"],
        }),
      ]
    );
  },
});

export default SideBar;
