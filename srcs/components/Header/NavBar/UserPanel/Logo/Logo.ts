import {
  createElement,
  defineComponent,
} from "../../../../../uccello/Uccello.js";

const Logo = defineComponent<void>({
  state() {},
  render() {
    return createElement("img", {
      src: "../../../../../../public/assets/logo.png",
      class: ["cursor-pointer"],
    });
  },
});

export default Logo;
