import { createElement, defineComponent } from "@/uccello/Uccello.js";

const EditInfo = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "div",
      {
        class: [
          "w-full",
          "border-2",
          "rounded-[30px]",
          "border-[#878787]",
          "border-opacity-[30%]",
          "items-start",
          "px-[40px]",
          "py-[20px]",
          "gap-5",
          "h-full",
          "col-span-4",
          "row-span-3",
          "row-start-3",
        ],
      },
      [
        createElement("div", { class: ["flex-row", "w-full"] }, [
          createElement("h3", { class: ["text-[18px]"] }, ["Edit your avatar"]),
          createElement("i", {
            class: [
              "ph",
              // this.state.icon,
              "transition-transform",
              "text-[24px]",
              "font-medium",
              "ease-in-out",
            ],
            style: {
              // color: this.state.color,
            },
            on: {},
          }),
        ]),
        createElement("hr", {
          class: [
            "w-full",
            "border-1",
            "border-[var(--light-grey)]",
            "rounded-full",
          ],
        }),
      ]
    );
  },
});

export default EditInfo;
