import { createElement, defineComponent } from "@/uccello/Uccello.js";

const Tournament = defineComponent<void>({
  onMounted() {
    document.title = "Tournament";
  },
  state() {},
  render() {
    return createElement("div", {}, ["Tournament Page"]);
  },
});

export default Tournament;
