import {
  createElement,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";
import NavBar from "./NavBar/NavBar.js";

interface HeaderProps {
  isLoggedIn: boolean;
}

const Header = defineComponent<void, HeaderProps>({
  state() {},
  render(this: IComponent<void, HeaderProps>) {
    return createElement(
      "header",
      {
        class: ["w-full", "pt-6"],
      },
      [createElement(NavBar, { isLoggedIn: this.props.isLoggedIn })]
    );
  },
});

export default Header;
