import { createElement, defineComponent } from "@/uccello/Uccello.js";
import Connect from "./Connect/Connect.js";
import Logo from "./Logo/Logo.js";

const VisitorPanel = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "div",
      {
        class: ["w-full", "flex", "flex-row", "gap-4", "items-center"],
      },
      [createElement(Logo), createElement(Connect)]
    );
  },
});

export default VisitorPanel;
