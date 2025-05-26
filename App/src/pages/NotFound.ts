import { createElement, defineComponent } from "@/uccello/Uccello.js";

const NotFound = defineComponent<void>({
  onMounted() {
    document.title = "404 Not Found";
  },
  state() {},
  render() {
    return createElement("div", { class: ["my-auto"] }, [
      createElement(
        "div",
        { class: ["text-9xl", "text-[var(--light-grey)]"] },
        ["404"]
      ),
      createElement("div", {}, ["Go To Home "]),
    ]);
  },
});

export default NotFound;
