import {
  createElement,
  createFragment,
  defineComponent,
  IComponent,
} from "../../../uccello/Uccello.js";
import UserPanel from "./UserPanel/UserPanel.js";
import VisitorPanel from "./VisitorPanel/VisitorPanel.js";

interface NavBarState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

const NavBar = defineComponent<NavBarState>({
  async onMounted(this: IComponent<NavBarState>) {
    try {
      const res: Response = await fetch("http://localhost:3000/auth");

      const data = await res.json();
      this.updateState({
        isAuthenticated: data.auth,
        isLoading: false,
      });
    } catch (error) {
      if (error instanceof Error) console.error(error.message);
    }
  },
  state(): NavBarState {
    return {
      isAuthenticated: false,
      isLoading: true,
    };
  },
  render(this: IComponent<NavBarState>) {
    return createElement("nav", {}, [
      this.state.isLoading
        ? ""
        : this.state.isAuthenticated
        ? createElement(UserPanel)
        : createElement(VisitorPanel),
    ]);
  },
});

export default NavBar;
