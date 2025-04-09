import { createElement, defineComponent } from "../uccello/Uccello.js";

const Welcome = defineComponent<void>({
  state() {},
  render() {
    return createElement("div", {}, ["Welcome Page"]);
  },
});

export default Welcome;
