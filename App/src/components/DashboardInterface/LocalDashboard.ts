import { router } from "@/router/Router";
import { createElement, defineComponent } from "@/uccello/Uccello";

const LocalDashboard = defineComponent({
  render() {
    return createElement(
      "div",
      {
        style: {
          "clip-path": "polygon(0 0, 95% 0, 85% 100%, 0% 100%)",
        },
        class: [
          "w-2/5",
          "h-full",
          "absolute",
          "top-0",
          "left-0",
          "rounded-tl-[30px]",
          "rounded-bl-[30px]",
          "border-2",
          "border-[#878787]",
          "border-opacity-[30%]",
          "items-start",
          "relative",
          "bg-[linear-gradient(188deg,rgba(221,242,71,0.02)_0%,rgba(135,135,135,0.02)_100%)]",
          "hover:bg-[linear-gradient(188deg,rgba(221,242,71,0.10)_0%,rgba(135,135,135,0.10)_100%)]",
          "justify-start",
        ],
      },
      [
        createElement("h3", { class: ["px-8", "pt-8"] }, [
          "Local Game Sessions".toUpperCase(),
        ]),
        createElement(
          "p",
          {
            class: [
              "text-4xl",
              "font-medium",
              "whitespace-wrap",
              "max-w-[75%]",
              "h-full",
              "content-center",
              "leading-relaxed",
              "text-[var(--light-grey)]",
              "px-8",
              "mb-auto",
            ],
          },
          ["Grab a friend and settle"]
        ),
        createElement(
          "button",
          {
            class: [
              "px-8",
              "py-2",
              "ml-24",
              "border-[2px]",
              "items-center",
              "text-black",
              "text-lg",
              "font-medium",
              "border-[var(--light-yellow)]",
              "bg-[var(--light-yellow)]",
              "rounded-[20px]",
              "flex",
              "gap-2",
              "hover:border-white",
              "hover:bg-white",
            ],
            on: {
              click: async () => await router.navigateTo("/localgame"),
            },
          },
          [
            "Play Local",
            createElement("i", {
              class: ["ph", "ph-arrow-up-right", "text-lg", "font-bold"],
            }),
          ]
        ),
      ]
    );
  },
});

export default LocalDashboard;
