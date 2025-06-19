import TournamentBracketState from "@/components/TournamentInterface/TournamentBracketState";
import TournamentInterface from "@/components/TournamentInterface/TournamentInterface";
import { createElement, defineComponent, eventBus } from "@/uccello/Uccello.js";

const Tournament = defineComponent<void>({
  onMounted() {
    document.title = "Tournament";
    eventBus.emit("navigate:bar", { data: "/tournament" });
  },
  state() {},
  render() {
    return createElement(
      "main",
      {
        class: ["flex", "flex-col", "w-full", "h-[90%]", "gap-4"],
      },
      [
        createElement(
          "div",
          { class: ["flex-row", "items-end", "w-fit", "gap-3"] },
          [
            createElement("img", {
              src: "/assets/trophy.png",
              class: ["w-[46px]"],
            }),
            createElement(
              "h2",
              { class: ["text-4xl", "text-[var(--main-color)]"] },
              ["Tournament"]
            ),
          ]
        ),
        createElement(
          "p",
          { class: ["text-[var(--light-grey)]", "text-[16px]"] },
          [
            "Compete, rally, and rise to the top! Join our thrilling Ping Pong tournament, where skill, speed, and strategy come together.",
          ]
        ),
        createElement(
          "section",
          {
            class: [
              "flex",
              "z-10",
              "gap-4",
              "w-full",
              "relative",
              "border-2",
              "py-8",
              "px-6",
              "max-lg:py-4",
              "h-[75vh]",
              "max-lg:h-full",
              "rounded-[30px]",
              "border-[#878787]",
              "border-opacity-[30%]",
            ],
          },
          [
            createElement(TournamentBracketState, {
            }),
          ]
        ),
      ]
    );
  },
});

export default Tournament;
