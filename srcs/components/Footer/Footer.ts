import { createElement, defineComponent } from "../../uccello/Uccello.js";

const Footer = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "div",
      {
        class: ["w-full", "flex", "flex-row"],
      },
      ["Footer"]
    );
  },
});

export default Footer;
