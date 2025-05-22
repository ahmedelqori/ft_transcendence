import GameInterface from "@/components/GameInterface/GameInterface.js";
import {
  createElement,
  defineComponent,
  eventBus,
  type IComponent,
} from "@/uccello/Uccello.js";
import { SocketManager } from "@/services/socket-manager.js";
import enhancedFetch from "@/Hooks/fetch.js";

interface LocalGameState {
  socketManager: SocketManager | null;
  isLoading: boolean;
  error: string | null;
  friendName: string;
  friendNameSet: boolean;
}

interface LocalGameMethods {
  setupLocalGame(): Promise<void>;
  handleFriendNameInput(e: Event): void;
  handleFriendNameSubmit(e: Event): void
  user: any | null;
}

const LocalGame = defineComponent<LocalGameState>({
  state(): LocalGameState {
    return {
      socketManager: null,
      isLoading: true,
      error: null,
      friendName: "",
      friendNameSet: false,
    };
  },

  onMounted(this: IComponent<LocalGameState> & LocalGameMethods) {
    document.title = "Local Game";
    eventBus.emit("navigate:bar", { data: "/game" });
    this.setupLocalGame();
  },

  async setupLocalGame(this: IComponent<LocalGameState> & LocalGameMethods) {
    try {
      this.updateState({ isLoading: true, error: null });

      const response = await enhancedFetch.fetch(
        "https://www.meedivo.me/api/account/whoami/"
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
        isLoading: false,
      });
      this.user = user
    } catch (err) {
      this.updateState({
        error:
          err instanceof Error ? err.message : "Failed to setup local game",
        isLoading: false,
      });
    }
  },
  handleFriendNameInput(this: IComponent<LocalGameState>, e: Event) {
    const value = (e.target as HTMLInputElement).value;
    this.updateState({ friendName: value });
  },

  handleFriendNameSubmit(this: IComponent<LocalGameState>, e: Event) {
    e.preventDefault();
    if (this.state.friendName.trim()) {
      this.updateState({ friendNameSet: true });
    }
    console.log(this.state.friendName)
  },
  render(this: IComponent<LocalGameState> & LocalGameMethods) {
    const { socketManager, isLoading, error, friendNameSet, friendName  } = this.state;
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
    } else if (isLoading || !socketManager) {
      content = createElement("div", {});
    } else if (!friendNameSet) {
      content = createElement(
        "div",
        {
          style: {
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            zIndex: "100",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            maxHeight: "100%",
            maxWidth: "100%"
          }
        },
        [
          createElement(
            "form",
            {
              style: {
                border: "2px solid #ddf247",
                boxShadow: "0 15px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(221, 242, 71, 0.3)",
                background: "rgba(30, 30, 30, 0.75)",
                borderRadius: "16px",
                padding: "clamp(20px, 5%, 50px) clamp(0px, 0%, 0px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "clamp(15px, 4%, 28px)",
                width: "clamp(280px, 50%, 400px)",
                maxWidth: "90%",
                transform: "translateY(-10px)"
              },
              onsubmit: (e: Event) => this.handleFriendNameSubmit(e),
            },
            [
              createElement(
                "div",
                {
                  style: {
                    textAlign: "center"
                  }
                },
                [
                  createElement(
                    "h1",
                    {
                      style: {
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: "clamp(1.3rem, 4vw, 1.7rem)",
                        fontWeight: "700",
                        marginBottom: "0.5rem",
                        color: "#ddf247",
                        textShadow: "0 0 5px rgba(221, 242, 71, 0.4)"
                      }
                    },
                    ["Enter your friend's name"]
                  )
                ]
              ),
              createElement(
                "input",
                {
                  id: "friend-name-input",
                  type: "text",
                  placeholder: "Friend's name",
                  value: friendName,
                  style: {
                    border: "2px solid #ddf247",
                    background: "transparent",
                    borderRadius: "10px",
                    padding: "18px 0",
                    width: "220px",
                    fontSize: "1.3rem",
                    textAlign: "center",
                    color: "#ddf247",
                    outline: "none",
                    marginBottom: "10px",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: "600",
                    transition: "border 0.2s"
                  },
                  oninput: (e: Event) => this.handleFriendNameInput(e),
                  required: true,
                }
              ),
              createElement(
                "button",
                {
                  type: "submit",
                  style: {
                    fontFamily: "'Poppins', sans-serif",
                    backgroundColor: "transparent",
                    color: "#ddf247",
                    border: "2px solid #ddf247",
                    padding: "12px 36px",
                    borderRadius: "6px",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    textShadow: "none",
                    outline: "none",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                    marginTop: "10px"
                  },
                  on: {
                    mouseover: (e: MouseEvent) => {
                      const target = e.target as HTMLElement;
                      if (target) {
                        target.style.backgroundColor = "rgba(221, 242, 71, 0.2)";
                      }
                    },
                    mouseout: (e: MouseEvent) => {
                      const target = e.target as HTMLElement;
                      if (target) {
                        target.style.backgroundColor = "transparent";
                      }
                    }
                  }
                },
                ["Start Game"]
              ),
            ]
          )
        ]
      );
    }
    else {
      content = createElement(GameInterface, {
        localSocketManager: socketManager,
        user: this.user,
        friendName: this.state.friendName,
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
