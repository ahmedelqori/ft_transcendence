import { authState } from "@/Hooks/Auth";
import enhancedFetch from "@/Hooks/fetch";
import { createElement, defineComponent, IComponent } from "@/uccello/Uccello";
import { stringify } from "querystring";
import Loader from "../Loader/Loader";

// endedAt: "2025-05-29T17:54:42.306Z";
// id: 33;
// playerOneId: 5;
// playerOneScore: 10;
// playerTwoId: 2;
// playerTwoScore: 7;
// startedAt: "2025-05-29T17:54:05.978Z";
// status: "FINISHED";
// tournementId: 0;
// winnerId: 5;

interface GamesDataInterface {
  playerOneId: number;
  playerOneScore: number;
  playerTwoId: number;
  playerTwoScore: number;
  startedAt: string;
  status: string;
  tournementId: number;
  winnerId: number;
}

interface GamesDashboardState {
  games: any[];
  isLoading: boolean;
}

const GamesDashboard = defineComponent<GamesDashboardState>({
  async onMounted(
    this: IComponent<GamesDashboardState> & { getGames: () => Promise<void> }
  ) {
    await this.getGames();
  },
  state() {
    return { games: [], isLoading: true };
  },
  render(this: IComponent<GamesDashboardState>) {
    return createElement(
      "div",
      {
        class: [
          "w-1/3",
          "min-w-[500px]",
          "h-full",
          "rounded-[30px]",
          "border-2",
          "border-[#878787]",
          "border-opacity-[30%]",
          "items-start",
          "px-2",
          "py-4",
          "gap-4",
          "relative",
        ],
      },
      [
        this.state.games.length !== 0
          ? createElement(
              "h3",
              {
                class: ["px-4"],
              },
              ["Last FOUR Matches :".toUpperCase()]
            )
          : null,
        this.state.isLoading
          ? createElement(Loader)
          : this.state.games.length === 0
          ? createElement(
              "div",
              {
                class: [
                  "w-full",
                  "text-xl",
                  "h-full",
                  "mt-auto",
                  "justify-center",
                  "text-[var(--light-grey)]",
                ],
              },
              ["No Games Yet"]
            )
          : createElement(
              "div",
              { class: ["w-full", "gap-2", "mb-auto"] },
              this.state.games.slice(0, 4).map((e) => {
                return createElement(
                  "div",
                  {
                    class: ["flex-row", "w-[100%]", "gap-4", "px-4", "py-1"],
                  },
                  [
                    createElement("div", { class: ["flex-row", "gap-4"] }, [
                      createElement("img", {
                        src: authState.getState().user?.avatar,
                        width: "64",
                        height: "64",
                        class: ["rounded-full", "h-16"],
                      }),
                      createElement(
                        "span",
                        { class: ["text-lg", "text-[var(--light-grey)]"] },
                        [authState.getState().user?.username]
                      ),
                    ]),
                    createElement(
                      "div",
                      {
                        class: [
                          "flex-row",
                          "gap-4",
                          "rounded-[30px]",
                          e.winner ? "bg-[#ddf247]" : "bg-[#ff4242]",
                          "px-4",
                          "py-1",
                          e.winner ? "text-black" : "text-white",
                          "font-medium",
                        ],
                      },
                      [
                        createElement("p", {}, [e.userScore]),
                        createElement("span", {}, [":"]),
                        createElement("p", {}, [e.friendScore]),
                      ]
                    ),
                    createElement("div", { class: ["flex-row", "gap-4"] }, [
                      createElement(
                        "span",
                        { class: ["text-lg", "text-[var(--light-grey)]"] },
                        [e.username]
                      ),
                      createElement("img", {
                        src: e.avatar,
                        width: "64",
                        height: "64",
                        class: ["rounded-full", "h-16"],
                      }),
                    ]),
                  ]
                );
              })
            ),
      ]
    );
  },
  async getGames(
    this: IComponent<GamesDashboardState> & {
      getFriendInfo: (
        id: number
      ) => Promise<{ avatar: string; username: string }>;
    }
  ) {
    try {
      const response = await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/games/user/${
          authState.getState().user?.id
        }`,
        {
          mode: "no-cors",
        }
      );
      const data = await response.json();
      const newData = await Promise.all(
        data.map(async (e: GamesDataInterface) => {
          let game;
          if (authState.getState().user?.id == e.playerOneId) {
            game = {
              friendId: e.playerTwoId,
              winner: e.winnerId == authState.getState().user?.id,
              userScore: e.playerOneScore,
              friendScore: e.playerTwoScore,
              avatar: "",
              username: "",
            };
          } else {
            game = {
              friendId: e.playerOneId,
              winner: e.winnerId == authState.getState().user?.id,
              userScore: e.playerTwoScore,
              friendScore: e.playerOneScore,
              avatar: "",
              username: "",
            };
          }
          const friendInfo = await this.getFriendInfo(game.friendId);
          game.avatar = friendInfo.avatar;
          game.username = friendInfo.username;
          return game;
        })
      );
      if (this.getIsMounted)
        this.updateState({
          games: newData,
          isLoading: false,
        });
    } catch (err) {}
  },
  async getFriendInfo(this: IComponent<GamesDashboardState>, id: number) {
    try {
      const res = await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/account/${id}`
      );
      const data = await res.json();
      return { avatar: data.avatar_url, username: data.username };
    } catch (err) {
      console.log(err);
      return { avatar: "", username: "" };
    }
  },
});

export default GamesDashboard;
