import { createElement, defineComponent, eventBus } from "@/uccello/Uccello.js";

const Tournament = defineComponent<void>({
  onMounted() {
    document.title = "Tournament";
    eventBus.emit("navigate:bar", { data: "/tournament" });
  },
  state() {},
  render() {
    return createElement("div", {}, ["Tournament Page"]);
  },
});

export default Tournament;
