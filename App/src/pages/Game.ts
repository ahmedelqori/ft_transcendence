import GameInterface from "@/components/GameInterface/GameInterface.js";
import Loader from "@/components/Loader/Loader";
import { router } from "@/router/Router";
import {
  createElement,
  defineComponent,
  type IComponent,
  eventBus,
} from "@/uccello/Uccello.js";

interface GameState {
  change: boolean;
}
const Game = defineComponent<GameState>({
  state() {
    return { change: false };
  },
  onMounted(this: IComponent<GameState> & { handleChangeParam: () => void }) {
    console.log("[Game] Component mounted");
    document.title = "Game";
    eventBus.emit("navigate:bar", { data: "/game" });
    window.addEventListener("hashchange", this.handleChangeParam);
    eventBus.on("change:game", () => {
      console.log("Hello");
      if (this.getIsMounted) this.updateState({ change: true });

      setTimeout(() => {
        if (this.getIsMounted) this.updateState({ change: false });
      }, 400);
    });
  },
  onUnMounted(this: IComponent<GameState> & { handleChangeParam: () => void }) {
    window.removeEventListener("hashchange", this.handleChangeParam);
  },
  render(this: IComponent<GameState>) {
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
      this.state.change === false
        ? [header, createElement(GameInterface)]
        : [createElement(Loader)]
    );
  },
  handleChangeParam(this: IComponent<GameState>) {
    if (router.getMatchedRoute?.path === "/game/:gameId") {
      eventBus.emit("change:game");
    }
  },
});

export default Game;
