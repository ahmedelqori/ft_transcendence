import { createElement, defineComponent } from "../uccello/Uccello.js";

const NotFound = defineComponent<void>({
  state() {},
  render() {
    return createElement("div", {}, ["NotFound Page"]);
  },
});

export default NotFound;
