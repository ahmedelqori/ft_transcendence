import { router } from "@/router/Router";
import { createElement, defineComponent } from "@/uccello/Uccello";

const TournamentDashboard = defineComponent({
  render() {
    return createElement(
      "div",
      {
        style: {
          "clip-path": " polygon(15% 0, 100% 0, 100% 100%, 5% 100%)",
        },
        class: [
          "w-2/5",
          "h-full",
          "absolute",
          "top-0",
          "right-0",
          "rounded-tr-[30px]",
          "rounded-br-[30px]",
          "border-2",
          "border-[#878787]",
          "border-opacity-[30%]",
          "items-start",
          "relative",
          "bg-[linear-gradient(188deg,rgba(221,242,71,0.02)_0%,rgba(135,135,135,0.02)_100%)]",
          "pb-8",
        ],
      },
      [
        createElement("h3", { class: ["px-28", "pt-8"] }, [
          "Open Tournament ".toUpperCase(),
        ]),
        createElement(
          "p",
          {
            class: [
              "text-4xl",
              "font-medium",
              "whitespace-nowrap",
              "max-w-[100%]",
              "h-full",
              "leading-relaxed",
              "text-[var(--light-grey)]",
              "pl-24",
              "py-4",
              "mb-auto",
            ],
          },
          ["Explore the Tournament"]
        ),
        createElement(
          "p",
          {
            class: [
              "text-lg",
              "font-normal",
              "whitespace-wrap",
              "max-w-[70%]",
              "max-h-8",
              "leading-relaxed",
              "text-white",
              "opacity-[30%]",
              "pl-24",
              "mb-28",
            ],
          },
          [
            "Check out the teams, match schedule, player info, and follow live scores as the tournament unfolds.",
          ]
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
              click: async () => await router.navigateTo("/tournament"),
            },
          },
          [
            "Let's Join",
            createElement(
              "i",
              { class: ["ph", "ph-arrow-up-right", "text-lg", "font-bold"] },
              []
            ),
          ]
        ),
        createElement("img", {
          class: ["w-[240px]", "h-[240px]", "absolute", "bottom-0", "right-0"],
          width: "240",
          height: "240",
          src: "assets/trophy.png",
        }),
      ]
    );
  },
});

export default TournamentDashboard;
