import {
  createElement,
  createFragment,
  defineComponent,
  IComponent,
} from "@/uccello/Uccello.js";
import Card from "./Cards/Card.js";
import FirstCard from "./Cards/FirstCard.js";
import SecondCard from "./Cards/SecondCard.js";
import ThirdCard from "./Cards/ThirdCard.js";
import enhancedFetch from "@/Hooks/fetch.js";
import { authState } from "@/Hooks/Auth.js";
import Loader from "../Loader/Loader.js";

interface LeaderBoardInterfaceState {
  allUsers: any[];
  isLoading: boolean;
}

const LeaderBoardInterface = defineComponent<LeaderBoardInterfaceState>({
  state() {
    return { allUsers: [], isLoading: true };
  },
  async onMounted(
    this: IComponent<LeaderBoardInterfaceState> & {
      handleGetUsers: () => Promise<void>;
    }
  ) {
    try {
      this.handleGetUsers();
    } catch (err) {}
  },
  render(this: IComponent<LeaderBoardInterfaceState>) {
    let index = this.state.allUsers.length > 3 ? 3 : 0;
    return createElement(
      "div",
      {
        class: [
          "w-[90%]",
          "h-full",
          "max-h-[85%]",
          "border-2",
          "rounded-[30px]",
          "border-[#878787]",
          "border-opacity-[30%]",
          "flex",
          "flex-col",
          "overflow-hidden",
          "p-5",
          "gap-[40px]",
        ],
      },
      [
        this.state.isLoading
          ? createElement(Loader)
          : createFragment([
              this.state.allUsers.length > 3
                ? createElement(
                    "div",
                    {
                      class: [
                        "flex",
                        "flex-row",
                        "justify-center",
                        "gap-5",
                        "w-full",
                      ],
                    },
                    [
                      createElement(SecondCard, {
                        username: this.state.allUsers[1].username,
                        index: 1,
                        avatar: this.state.allUsers[1].avatar,
                        xp: this.state.allUsers[1].xp,
                      }),
                      createElement(FirstCard, {
                        username: this.state.allUsers[0].username,
                        index: 0,
                        avatar: this.state.allUsers[0].avatar,
                        xp: this.state.allUsers[0].xp,
                      }),
                      createElement(ThirdCard, {
                        username: this.state.allUsers[2].username,
                        index: 2,
                        avatar: this.state.allUsers[2].avatar,
                        xp: this.state.allUsers[2].xp,
                      }),
                    ]
                  )
                : null,
              createElement(
                "div",
                {
                  class: [
                    "w-full",
                    "flex-1",
                    "flex",
                    "flex-col",
                    "gap-4",
                    "pr-2",
                    "justify-start",
                    "overflow-scroll",
                    "overflow-x-hidden",
                    "overflow-y-auto",
                    "[&::-webkit-scrollbar]:w-1",
                    "[&::-webkit-scrollbar-track]:rounded-full",
                    "[&::-webkit-scrollbar-track]:bg-gray-100",
                    "[&::-webkit-scrollbar-thumb]:rounded-full",
                    "[&::-webkit-scrollbar-thumb]:bg-gray-300",
                    "dark:[&::-webkit-scrollbar-track]:bg-transparent",
                    "dark:[&::-webkit-scrollbar-thumb]:bg-[#ddf247]",
                    "dark:[&::-webkit-scrollbar-thumb]:bg-opacity-[70%]",
                  ],
                },
                this.state.allUsers.splice(index).map((user) =>
                  createElement(Card, {
                    username: user.username,
                    index: index++,
                    avatar: user.avatar,
                    xp: user.xp,
                  })
                )
              ),
            ]),
      ]
    );
  },
  async handleGetUsers(
    this: IComponent<LeaderBoardInterfaceState> & {
      extractData: (i: number) => Promise<number>;
    }
  ) {
    try {
      const response = await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/account/users/?n=200&sort=newest`,
        {
          mode: "no-cors",
        }
      );
      const data = await response.json();
      const arr = [];
      for (let i = 0; i < data.length; i++) {
        arr.push({
          id: data[i].id,
          xp: await this.extractData(data[i].id as number),
          username: data[i].username,
          avatar: data[i].avatar_url,
        });
      }
      if (this.getIsMounted) {
        this.updateState({
          allUsers: arr.sort((a: any, b: any) => b.xp - a.xp),
          isLoading: false,
        });
      }
    } catch (err) {}
  },

  async extractData(
    this: IComponent<LeaderBoardInterfaceState>,
    userid: number
  ) {
    try {
      const response = await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/games/user/${userid}`,
        {
          mode: "no-cors",
        }
      );
      if (!response.ok) throw response;
      const arr = await response.json();
      let winnerGames: number = 0;
      let loseGames: number = 0;
      let currentXp: number = 0;
      arr.map((e: any) => {
        e.winnerId === userid ? winnerGames++ : loseGames++;
        currentXp +=
          e.playerOneId == userid
            ? e.playerOneScore - e.playerTwoScore
            : e.playerTwoScore - e.playerOneScore;
      });
      const xp = 50 * winnerGames - 20 * loseGames + 2 * currentXp;
      return xp >= 0 ? xp : 0;
    } catch (err) {}
  },
});

export default LeaderBoardInterface;
