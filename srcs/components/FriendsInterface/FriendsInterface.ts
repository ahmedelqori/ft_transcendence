import { createElement, defineComponent } from "../../uccello/Uccello.js";

const FriendsInterface = defineComponent<void>({
  state() {},
  render() {
    return createElement("div", {
      class: [
        "w-[90%]",
        "h-full",
        "border-2",
        "rounded-[30px]",
        "border-[#878787]",
        "border-opacity-[30%]",
      ],
    });
  },
});

export default FriendsInterface;
