import {
  createElement,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";
import UserPanel from "./UserPanel/UserPanel.js";
import VisitorPanel from "./VisitorPanel/VisitorPanel.js";

interface NavBarState {
  isLoading: boolean;
}

interface NavBarProps {
  isLoggedIn: boolean;
}

const NavBar = defineComponent<NavBarState, NavBarProps>({
  async onMounted(this: IComponent<NavBarState, NavBarProps>) {},
  state(): NavBarState {
    return {
      isLoading: true,
    };
  },
  render(this: IComponent<NavBarState, NavBarProps>) {
    return createElement("nav", {}, [
      this.props.isLoggedIn
        ? createElement(UserPanel)
        : createElement(VisitorPanel),
    ]);
  },
});

export default NavBar;
