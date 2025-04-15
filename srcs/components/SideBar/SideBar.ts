import { router } from "../../router/Router.js";
import { createElement, defineComponent } from "../../uccello/Uccello.js";
import NavigationBar from "./NavigationBar/NavigationBar.js";

const SideBar = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "aside",
      {
        class: [
          "w-fit",
          "h-5/6",
          "shrink-0",
          "flex",
          "flex-col",
          "justify-around",
          "items-start",
          "self-center",
          "max-lg:w-full",
          "max-lg:py-4",
          "max-lg:h-fit",
          "max-lg:self-center",
          "max-lg:items-center",
          "max-lg:justify-between",
        ],
      },
      [
        createElement("hr", {
          class: [
            "hidden",
            "lg:block",
            "w-full",
            "text-[4px]",
            "border-[#878787]",
          ],
        }),
        createElement(NavigationBar, { class: ["w-full"] }),
        createElement("hr", {
          class: [
            "hidden",
            "lg:block",
            "w-full",
            "text-[4px]",
            "border-[#878787]",
          ],
        }),
      ]
    );
  },
});

export default SideBar;
