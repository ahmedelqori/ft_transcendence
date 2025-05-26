import { createElement, defineComponent, eventBus } from "@/uccello/Uccello.js";

const Tmp = defineComponent<void>({
  onMounted() {
    document.title = "Tmp";
    eventBus.emit("navigate:bar", { data: "/settings" });
  },
  state() {},
  render() {
    return createElement(
      "main",
      {
        class: [
          "col-span-3",
          "w-full",
          "h-[90%]",
          "mt-[20px]",
          "items-start",
          "flex",
          "flex-col",
          "gap-[20px]",
        ],
      },
      [
        "Main",
        createElement("div", {
          on: {
            input: () => {},
          },
        }),
      ]
    );
  },
});

export default Tmp;
