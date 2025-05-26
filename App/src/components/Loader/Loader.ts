import { createElement, defineComponent } from "@/uccello/Uccello";

const Loader = defineComponent({
  render() {
    return createElement(
      "div",
      {
        class: [
          "flex",
          "items-center",
          "justify-center",
          "h-full",
          "w-full",
          "bg-transparent",
        ],
      },
      [
        createElement("div", {
          class: [
            "animate-spin",
            "rounded-full",
            "h-16",
            "w-16",
            "border-4",
            "border-[var(--light-yellow)]",
            "border-t-transparent",
          ],
        }),
      ]
    );
  },
});

export default Loader;
