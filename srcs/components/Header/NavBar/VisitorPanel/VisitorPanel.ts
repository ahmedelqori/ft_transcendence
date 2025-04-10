import { createElement, defineComponent } from "../../../../uccello/Uccello.js";

const VisitorPanel = defineComponent<void>({
  state() {},
  render() {
    return createElement("div", {}, ["VisitorPanel Page"]);
  },
});

export default VisitorPanel;
