import {
  createElement,
  defineComponent,
  RouterLink,
} from "../../../../../uccello/Uccello.js";

const Logo = defineComponent<void>({
  state() {},
  render() {
    return createElement(RouterLink, { to: "/" }, [
      createElement("img", {
        src: "../../../../../../public/assets/logo.png",
        class: ["hidden", "md:block", "logo"],
      }),
      createElement("img", {
        src: "../../../../../../public/assets/smallLogo.png",
        class: ["block", "md:hidden", "w-[48px]", "logo"],
      }),
    ]);
  },
});

export default Logo;
