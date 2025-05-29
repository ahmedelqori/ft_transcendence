import { createElement, defineComponent } from "@/uccello/Uccello";

const TournamentDashboard = defineComponent({
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
        ],
      },
      [
        createElement("h3", { class: ["px-8", "pt-8"] }, [
          "Ping Pong Showdown".toUpperCase(),
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
          [
            "It’s time for fast rallies, epic smashes and non-stop ping pong action.",
          ]
        ),
        createElement(
          "button",
          {
            class: [
              "absolute",
              "right-[-36%]",
              "top-1/2",
              "-translate-y-1/2",
              "transform",
              "-rotate-[81deg]",
              "w-full",
              "h-[48px]",
              "rounded-[33px]",
              "text-black",
              "bg-[var(--light-yellow)]",
              "font-medium",
              "text-xl",
            ],
          },
          ["Play"]
        ),
      ]
    );
  },
});

export default TournamentDashboard;
