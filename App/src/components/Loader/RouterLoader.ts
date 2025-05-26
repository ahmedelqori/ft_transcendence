import { createElement, defineComponent } from "@/uccello/Uccello";

const RouterLoader = defineComponent<void>({
  state() {
    return {};
  },
  render() {
    return createElement("div", {}, ["isLoading"]);
  },
});

export default RouterLoader;
