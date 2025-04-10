import {
  createElement,
  defineComponent,
} from "../../../../../../uccello/Uccello.js";

const User = defineComponent<void>({
  state() {},
  render() {
    return createElement("div", {}, [
      createElement("img", {
        class: [
          "w-[60px]",
          "h-[60px]",
          "rounded-full",
          "z-10",
          "cursor-pointer",
          // "outline-coloe"
        ],
        src: "../../../../../../../public/assets/avatar.png",
      }),
    ]);
  },
});

export default User;
