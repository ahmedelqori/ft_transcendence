import GameInterface from "@/components/GameInterface/GameInterface.js";
import {
  createElement,
  defineComponent,
  eventBus,
  type IComponent,
} from "@/uccello/Uccello.js";

interface LocalGameState {
  isLoading: boolean;
  error: string | null;
}

const LocalGame = defineComponent<LocalGameState>({
  state(): LocalGameState {
    return {
      isLoading: false,
      error: null,
    };
  },

  onMounted() {
    document.title = "Local Game";
    eventBus.emit("navigate:bar", { data: "/game" });
  },

  render(this: IComponent<LocalGameState>) {
    const { error } = this.state;
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
            "Local Game",
          ]
        ),
      ]
    );

    let content;
    if (error) {
      content = createElement(
        "div",
        {
          class: [
            "text-red-500",
            "text-center",
            "w-full",
            "py-8",
            "bg-red-100",
            "rounded-lg",
            "border",
            "border-red-300",
            "p-4",
          ],
        },
        [`Error: ${error}. Please try again.`]
      );
    } else {
      content = createElement(GameInterface, {
        isLocal: true,
      });
    }

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
      [header, content]
    );
  },
});

export default LocalGame;
