import {
  createElement,
  defineComponent,
} from "../../../../../../uccello/Uccello.js";

const User = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "div",
      {
        class: [
          "w-[60px]",
          "h-[60px]",
          "rounded-full",
          "flex",
          "items-center",
          "justify-center",
          "shadow-[0_0_8px_5px_#ddf247]",
          "z-10",
        ],
      },
      [
        createElement("img", {
          class: ["w-full", "h-full", "rounded-full", "cursor-pointer"],
          src: "../../../../../../../public/assets/avatar.png",
        }),
      ]
    );
  },
});

export default User;
