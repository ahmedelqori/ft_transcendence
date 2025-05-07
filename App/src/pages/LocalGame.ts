import GameInterface from "@/components/GameInterface/GameInterface.js";
import { createElement, defineComponent, type IComponent } from "@/uccello/Uccello.js";
import { SocketManager } from "@/services/socket-manager.js";
import enhancedFetch from "@/Hooks/fetch.js";

interface LocalGameState {
  socketManager: SocketManager | null;
}

interface LocalGameMethods {
  setupLocalGame(): Promise<void>;
}

const LocalGame = defineComponent<LocalGameState>({
  onMounted(this: IComponent<LocalGameState> & LocalGameMethods) {
    document.title = "Local Game";
    this.setupLocalGame();
  },
  
  state(): LocalGameState {
    return {
      socketManager: null
    };
  },
  
  async setupLocalGame(this: IComponent<LocalGameState> & LocalGameMethods) {
    try {
      const response = await enhancedFetch.fetch(
        "https://64.23.191.17/api/account/whoami/"
      );
      const user = await response.json();      
      const gameId = `local_${Date.now()}`;      
      const socketManager = new SocketManager();
      socketManager.init(gameId, user.id);      
      socketManager.setLocalGameMode(true);
      this.updateState({ socketManager });
    } catch (err) {
      console.error("Failed to setup local game:", err);
    }
  },
  
  render(this: IComponent<LocalGameState> & LocalGameMethods) {
    const { socketManager } = this.state;
    
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
                "Local Game",
              ]
            ),
          ]
        ),
        socketManager ? 
          createElement(GameInterface, { localSocketManager: socketManager }) : 
          createElement("div", { class: ["text-white", "text-center", "w-full", "py-8"] }, ["Loading game..."])
      ]
    );
  },
});

export default LocalGame;