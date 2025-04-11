import { createElement, defineComponent } from "../../../uccello/Uccello.js";
import Friend from "./Friend/Friends.js";
import Search from "./Search/Search.js";

const Friends = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "div",
      {
        class: ["w-[30%]", "h-full", "gap-4", "justify-start"],
      },
      [
        createElement(Search),
        createElement(Friend),
        createElement(Friend),
        createElement(Friend),
        createElement(Friend),
        createElement(Friend),
        createElement(Friend),
        createElement(Friend),
      ]
    );
  },
});

export default Friends;
