import GameInterface from "@/components/GameInterface/GameInterface.js";
import { createElement, defineComponent, eventBus } from "@/uccello/Uccello.js";

const Game = defineComponent<void>({
  onMounted() {
    document.title = "Game";
    eventBus.emit("navigate:bar", { data: "/game" });
  },
  state() {},
  render() {
    return createElement(
      "main",
      {
        class: [
          "flex",
          "w-full",
          "flex-col",
          "my-auto",
          "gap-[20px]",
          "items-start",
        ],
      },
      [
        createElement(
          "div",
          {
            class: [
              "items-center",
              "justify-between",
              "flex",
              "flex-row",
              "w-full",
              "max-lg:h-full",
              "max-lg:hidden",
              "px-4",
            ],
          },
          [
            createElement(
              "div",
              {
                class: [
                  "flex",
                  "flex-row",
                  "items-center",
                  "gap-5",
                  "max-xl:gap-2",
                  "text-[24px]",
                  "max-xl:text-[18px]",
                  "text-[var(--light-grey)]",
                ],
              },
              [
                createElement("i", {
                  class: [
                    "flex-row",
                    "text-[var(--light-yellow)]",
                    "ph",
                    "ph-game-controller",
                    "text-[46px]",
                    "max-xl:text-[28px]",
                  ],
                }),
                "Live Game",
              ]
            ),
          ]
        ),
        createElement(GameInterface),
      ]
    );
  },
});

export default Game;
