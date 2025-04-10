import { createElement, defineComponent } from "../../uccello/Uccello.js";
import NavBar from "./NavBar/NavBar.js";

const Header = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "header",
      {
        class: ["w-full"],
      },
      [createElement(NavBar)]
    );
  },
});

export default Header;
