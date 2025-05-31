import { createElement, defineComponent } from "@/uccello/Uccello.js";

const FloatNotification = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "div",
      {
        class: [
          "flex-row",
          "gap-[20px]",
          "realtive",
          "w-full",
          "max-w-[400px]",
          "overflow-hidden",
        ],
        "data-style": "smooth",
        style: {
          "--duration": "3",
        },
      },
      [
        createElement("img", {
          src: "assets/afanidi.png",
          class: ["w-[40px]", "rounded-full"],
        }),
        createElement("div", { class: ["mr-auto", "items-start"] }, [
          createElement("p", { class: ["text-[14px]"] }, ["Meedivo"]),

          createElement(
            "span",
            {
              class: ["text-[var(--light-grey)]", "text-[10px]"],
            },
            ["Send Request"]
          ),
        ]),
        createElement("div", { class: ["flex-row", "gap-2"] }, [
          createElement(
            "button",
            {
              class: [
                "rounded-[16px]",
                "bg-[var(--light-yellow)]",
                "text-[var(--dark-black)]",
                "px-2",
                "py-1",
                "text-[10px]",
                "font-medium",
                "hover:scale-[104%]",
              ],
            },
            ["Accept"]
          ),
          createElement(
            "button",
            {
              class: [
                "rounded-[16px]",
                "bg-[var(--red-color)]",
                "text-[var(--dark-black)]",
                "text-[10px]",
                "px-2",
                "py-1",
                "font-medium",
                "hover:scale-[104%]",
              ],
            },
            ["Decline"]
          ),
        ]),

        createElement("div", {
          class: [
            "bottom-[1px]",
            "rounded-[10px]",
            "absolute",
            "w-[95%]",
            "h-[2px]",
            "origin-left",
            "bg-[var(--light-yellow)]",
          ],
          style: {
            animation: "roundtime 3s linear forwards",
            transformOrigin: "right",
          },
        }),
      ]
    );
  },
});

export default FloatNotification;
