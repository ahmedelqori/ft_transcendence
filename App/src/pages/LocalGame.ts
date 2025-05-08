import GameInterface from "@/components/GameInterface/GameInterface.js";
import { createElement, defineComponent, type IComponent } from "@/uccello/Uccello.js";
import { SocketManager } from "@/services/socket-manager.js";
import enhancedFetch from "@/Hooks/fetch.js";

interface LocalGameState {
  socketManager: SocketManager | null;
  isLoading: boolean;
  error: string | null;
}

interface LocalGameMethods {
  setupLocalGame(): Promise<void>;
}

const LocalGame = defineComponent<LocalGameState>({
  state(): LocalGameState {
    return {
      socketManager: null,
      isLoading: true,
      error: null
    };
  },

  onMounted(this: IComponent<LocalGameState> & LocalGameMethods) {
    document.title = "Local Game";
    this.setupLocalGame();
  },
  
  async setupLocalGame(this: IComponent<LocalGameState> & LocalGameMethods) {
    try {
      this.updateState({ isLoading: true, error: null });
      
      const response = await enhancedFetch.fetch(
        "https://64.23.191.17/api/account/whoami/"
      );
      
      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.statusText}`);
      }
      
      const user = await response.json();
      
      const gameId = `local_${Date.now()}`;
      
      const socketManager = new SocketManager();
      socketManager.init(gameId, user.id);
      socketManager.setLocalGameMode(true);
      
      this.updateState({ 
        socketManager, 
        isLoading: false 
      });
    } catch (err) {
      this.updateState({ 
        error: err instanceof Error ? err.message : "Failed to setup local game", 
        isLoading: false 
      });
    }
  },
  
  render(this: IComponent<LocalGameState> & LocalGameMethods) {
    const { socketManager, isLoading, error } = this.state;
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
            "p-4"
          ] 
        }, 
        [`Error: ${error}. Please try again.`]
      );
    } else if (isLoading || !socketManager) {
      content = createElement(
        "div", 
        {},
      );
    } else {
      content = createElement(GameInterface, { localSocketManager: socketManager });
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