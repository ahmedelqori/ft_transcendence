import GameInterface from "@/components/GameInterface/GameInterface.js";
import { createElement, defineComponent, type IComponent } from "@/uccello/Uccello.js";

interface GameState {
  isLoading: boolean;
}

const Game = defineComponent<void>({
  state(): void {},
  onMounted(this: IComponent<void>) {
    console.log("[Game] Component mounted");
    document.title = "Game";
  },

  render(this: IComponent<void>) {
    console.log("[Game] Rendering game page");
    
    const header = createElement(
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
    );

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
      [header, createElement(GameInterface)]
    );
  },
});

export default Game;
