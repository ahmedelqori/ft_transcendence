import { createElement, defineComponent } from "../../../../uccello/Uccello.js";
import Logo from "./Logo/Logo.js";
import Profile from "./Profile/Profile.js";
import Searchbar from "./Searchbar/SearchBar.js";

const UserPanel = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "div",
      {
        class: ["w-full", "flex", "flex-row"],
      },
      [createElement(Logo), createElement(Searchbar), createElement(Profile)]
    );
  },
});

export default UserPanel;
