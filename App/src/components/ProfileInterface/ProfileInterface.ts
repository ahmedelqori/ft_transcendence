import { authState } from "@/Hooks/Auth";
import enhancedFetch from "@/Hooks/fetch.js";
import { router } from "@/router/Router";
import {
  createElement,
  createFragment,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";

interface ProfileInterfaceProps {
  username: string;
  whoami: string;
}

interface ProfileInterfaceState {
  id: number;
  avatar: any;
  isLoading: boolean;
  createdAt: string | null;
  found: boolean;
  animationComplete: boolean;
  gameWin: number;
  gameLose: number;
  scoreDiffrence: number;
  relationShip: string;
}
const ProfileInterface = defineComponent<
  ProfileInterfaceState,
  ProfileInterfaceProps
>({
  async onMounted(
    this: IComponent<ProfileInterfaceState, ProfileInterfaceProps> & {
      extractData: (data: any, userid: string) => void;
    }
  ) {
    try {
      document.title = this.props.username;
      const res = await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/account/${this.props.username}`
      );
      if (!res.ok) throw res;

      const user = await res.json();
      const relationResponse = await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/friends/${user.id}`
      );
      const relation = await relationResponse.json();
      const response = await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/games/user/${user.id}`,
        {
          mode: "no-cors",
        }
      );
      if (!res.ok) throw res;
      const data = await response.json();
      this.extractData(data, user.id);
      const isoDate = user.created_at;
      const date = new Date(isoDate);
      const day = date.getUTCDate();
      const month = date.toLocaleString("en-US", {
        month: "short",
        timeZone: "UTC",
      });
      const year = date.getUTCFullYear().toString().slice(-2);
      const formattedDate = `${day}-${month}-${year}`;

      setTimeout(() => {
        if (this.getIsMounted)
          this.updateState({
            avatar: user.avatar_url,
            found: true,
            isLoading: false,
            createdAt: formattedDate,
            animationComplete: false,
            id: user.id,
            relationShip: relation.status,
          });

        setTimeout(() => {
          if (this.getIsMounted)
            this.updateState({
              animationComplete: true,
            });
        }, 800);
      }, 1000);
    } catch (err: any) {
      if (err.status === 404)
        if (this.getIsMounted)
          this.updateState({
            avatar: null,
            found: false,
            isLoading: false,
            createdAt: null,
            animationComplete: false,
            id: -1,
            relationShip: "none",
          });
    }
  },
  state() {
    return {
      avatar: null,
      isLoading: true,
      found: false,
      createdAt: null,
      animationComplete: false,
      gameWin: 0,
      gameLose: 0,
      scoreDiffrence: 0,
      id: -1,
      relationShip: "none",
    };
  },
  render(
    this: IComponent<ProfileInterfaceState, ProfileInterfaceProps> & {
      handlePlayButton: () => Promise<void>;
      handleUnfriendButton: () => Promise<void>;
    }
  ) {
    return createElement(
      "div",
      {
        class: [
          "p-5",
          "flex",
          "w-[90%]",
          "h-full",
          "items-center",
          "flex-row",
          "gap-[40px]",
          "justify-center",
          "overflow-hidden",
        ],
      },
      [
        this.state.isLoading
          ? createElement(
              "div",
              {
                class: [
                  "items-center",
                  "justify-center",
                  "h-full",
                  "w-full",
                  "bg-transparent",
                ],
              },
              [
                createElement("div", {
                  class: [
                    "animate-spin",
                    "rounded-full",
                    "h-16",
                    "w-16",
                    "border-4",
                    "border-[var(--light-yellow)]",
                    "border-t-transparent",
                  ],
                }),
              ]
            )
          : !this.state.found
          ? createElement(
              "div",
              {
                class: [
                  "flex",
                  "flex-col",
                  "items-center",
                  "justify-center",
                  "h-full",
                  "rounded-xl",
                  "p-10",
                  "shadow-md",
                  "text-center",
                  "max-w-md",
                  "mx-auto",
                ],
              },
              [
                createElement("i", {
                  class: [
                    "ph",
                    "ph-ghost",
                    "text-8xl",
                    "mb-6",
                    "p-4",
                    "rounded-full",
                  ],
                }),
                createElement(
                  "h2",
                  {
                    class: [
                      "text-3xl",
                      "font-bold",
                      "text-[var(--main-color)]",
                      "mb-3",
                    ],
                  },
                  ["User Not Found"]
                ),
                createElement(
                  "p",
                  {
                    class: ["text-gray-500", "text-lg", "max-w-md"],
                  },
                  [
                    "We couldn't find any profile with the username ",
                    createElement(
                      "span",
                      {
                        class: ["font-semibold", "text-[var(--light-yellow)]"],
                      },
                      [this.props.username]
                    ),
                    ". Please check the spelling or try again later.",
                  ]
                ),
              ]
            )
          : createFragment([
              createElement(
                "img",
                {
                  src: this.state.avatar,
                  class: [
                    "rounded-full",
                    "w-[200px]",
                    "h-[200px]",
                    "transition-all",
                    "duration-500",
                    "animate-fadeIn",
                    "shadow-lg",
                    "border-4",
                    "border-[var(--main-color)]",
                    "hover:scale-105",
                    "hover:border-[var(--light-yellow)]",
                  ],
                  style: {
                    animation: "fadeIn 0.8s ease-in-out",
                  },
                },
                []
              ),
              createElement(
                "div",
                {
                  class: [
                    "gap-8",
                    "w-[40%]",
                    "transition-all",
                    "duration-500",
                    "animate-slideRight",
                  ],
                  style: {
                    animation: "slideRight 0.6s ease-out",
                  },
                },
                [
                  createElement(
                    "div",
                    {
                      class: ["flex-row", "justify-end", "gap-4", "w-full"],
                    },
                    [
                      this.state.relationShip === "friend" ||
                      this.state.relationShip === "blocked"
                        ? createElement(
                            "button",
                            {
                              class: [
                                "z-10",
                                "px-10",
                                "py-2",
                                "gap-2",
                                "text-lg",
                                "flex-row",
                                "rounded-xl",
                                "font-medium",
                                "text-white",
                                "cursor-pointer",
                                "bg-[var(--red-color)]",
                                "transition-all",
                                "duration-300",
                                "hover:scale-[110%]",

                                this.state.animationComplete
                                  ? "opacity-100"
                                  : "opacity-0",
                              ],
                              on: {
                                click: async () =>
                                  await this.handleUnfriendButton(),
                              },
                            },
                            [
                              this.state.relationShip === "blocked"
                                ? "Lah Ysameh"
                                : "Unfriend",
                            ]
                          )
                        : null,
                      this.state.id !== authState.getState().user?.id &&
                      this.state.relationShip != "blocked"
                        ? createElement(
                            "button",
                            {
                              class: [
                                "z-10",
                                "px-6",
                                "py-2",
                                "gap-2",
                                "text-lg",
                                "flex-row",
                                "rounded-xl",
                                "font-medium",
                                "text-black",
                                "cursor-pointer",
                                "bg-[var(--light-yellow)]",
                                "transition-all",
                                "duration-300",
                                "hover:scale-[110%]",
                                this.state.animationComplete
                                  ? "opacity-100"
                                  : "opacity-0",
                              ],

                              on: {
                                click: () => this.handlePlayButton(),
                              },
                            },
                            [
                              this.state.relationShip === "friend"
                                ? "Let's Play"
                                : "Add Friend",
                            ]
                          )
                        : null,
                    ]
                  ),
                  createElement(
                    "div",
                    {
                      class: [
                        "items-start",
                        "w-full",
                        "gap-2",
                        "transition-all",
                        "duration-500",
                        this.state.animationComplete
                          ? "opacity-100"
                          : "opacity-0",
                      ],
                      style: {
                        transitionDelay: "200ms",
                      },
                    },
                    [
                      createElement(
                        "h4",
                        {
                          class: [
                            "text-3xl",
                            "font-semibold",
                            "transition-all",
                            "duration-300",
                            "text-[var(--main-color)]",
                            "hover:text-[var(--light-yellow)]",
                          ],
                        },
                        [this.props.username]
                      ),
                      createElement(
                        "p",
                        {
                          class: [
                            "text-[var(--light-grey)]",
                            "text-sm",
                            "transition-all",
                            "duration-300",
                          ],
                        },
                        [`Joined at ${this.state.createdAt}`]
                      ),
                      createElement(
                        "div",
                        {
                          class: ["w-full", "gap-2", "mt-2"],
                        },
                        [
                          createElement(
                            "h5",
                            {
                              class: [
                                "text-[var(--light-grey)]",
                                "text-sm",
                                "self-end",
                              ],
                            },
                            [`${this.state.scoreDiffrence}/10000xp`]
                          ),
                          createElement(
                            "div",
                            {
                              class: [
                                "w-full",
                                "bg-white",
                                "rounded-full",
                                "h-2.5",
                                "items-start",
                                "overflow-hidden",
                              ],
                            },
                            [
                              createElement("div", {
                                class: [
                                  "bg-[var(--light-yellow)]",
                                  "h-2.5",
                                  "rounded-full",
                                  "transition-all",
                                  "duration-1000",
                                ],
                                style: {
                                  width: this.state.animationComplete
                                    ? `${
                                        (this.state.scoreDiffrence / 10000) *
                                        100
                                      }%`
                                    : "0%",
                                  transitionDelay: "600ms",
                                },
                              }),
                            ]
                          ),
                        ]
                      ),
                    ]
                  ),
                  createElement(
                    "div",
                    {
                      class: [
                        "flex-row",
                        "w-full",
                        "mt-4",
                        "justify-between",
                        "transition-all",
                        "duration-500",
                        "opacity-0",
                        this.state.animationComplete
                          ? "opacity-100"
                          : "opacity-0",
                      ],
                      style: {
                        transitionDelay: "500ms",
                      },
                    },
                    [
                      createElement(
                        "div",
                        {
                          class: [
                            "flex-row",
                            "gap-4",
                            "transform",
                            "transition-all",
                            "duration-300",
                            "hover:scale-105",
                          ],
                        },
                        [
                          createElement("i", {
                            class: [
                              "ph",
                              "ph-trophy",
                              "text-4xl",
                              "text-[var(--dark-black)]",
                              "bg-[var(--main-color)]",
                              "rounded-[12px]",
                              "p-2",
                              "transition-all",
                              "duration-300",
                              "hover:bg-[var(--light-yellow)]",
                            ],
                          }),
                          createElement("div", { class: "items-start" }, [
                            createElement(
                              "p",
                              {
                                class: [
                                  "text-[var(--main-color)]",
                                  "text-2xl",
                                  "font-bold",
                                ],
                              },
                              [`${this.state.gameWin}`]
                            ),
                            createElement(
                              "p",
                              {
                                class: ["text-[var(--light-grey)]", "text-sm"],
                              },
                              ["Games Win"]
                            ),
                          ]),
                        ]
                      ),
                      createElement(
                        "div",
                        {
                          class: [
                            "flex-row",
                            "gap-4",
                            "transform",
                            "transition-all",
                            "duration-300",
                            "hover:scale-105",
                          ],
                        },
                        [
                          createElement("i", {
                            class: [
                              "ph",
                              "ph-flag",
                              "text-4xl",
                              "text-[var(--dark-black)]",
                              "bg-[var(--main-color)]",
                              "rounded-[12px]",
                              "p-2",
                              "transition-all",
                              "duration-300",
                              "hover:bg-[var(--light-yellow)]",
                            ],
                          }),
                          createElement("div", { class: "items-start" }, [
                            createElement(
                              "p",
                              {
                                class: [
                                  "text-[var(--main-color)]",
                                  "text-2xl",
                                  "font-bold",
                                ],
                              },
                              [`${this.state.gameLose}`]
                            ),
                            createElement(
                              "p",
                              {
                                class: ["text-[var(--light-grey)]", "text-sm"],
                              },
                              ["Games Lose"]
                            ),
                          ]),
                        ]
                      ),
                      createElement(
                        "div",
                        {
                          class: [
                            "flex-row",
                            "gap-4",
                            "transform",
                            "transition-all",
                            "duration-300",
                            "hover:scale-105",
                          ],
                        },
                        [
                          createElement("i", {
                            class: [
                              "ph",
                              "ph-shooting-star",
                              "text-4xl",
                              "text-[var(--dark-black)]",
                              "bg-[var(--main-color)]",
                              "rounded-[12px]",
                              "p-2",
                              "transition-all",
                              "duration-300",
                              "hover:bg-[var(--light-yellow)]",
                            ],
                          }),
                          createElement("div", { class: "items-start" }, [
                            createElement(
                              "p",
                              {
                                class: [
                                  "text-[var(--main-color)]",
                                  "text-2xl",
                                  "font-bold",
                                ],
                              },
                              ["32"]
                            ),
                            createElement(
                              "p",
                              {
                                class: ["text-[var(--light-grey)]", "text-sm"],
                              },
                              ["highest score"]
                            ),
                          ]),
                        ]
                      ),
                    ]
                  ),
                  createElement(
                    "div",
                    {
                      class: [
                        "w-full",
                        "mt-11",
                        "transition-all",
                        "duration-500",
                        this.state.animationComplete
                          ? "opacity-100"
                          : "opacity-0",
                      ],
                      style: {
                        transitionDelay: "700ms",
                      },
                    },
                    [
                      createElement(
                        "p",
                        {
                          class: [
                            "text-[var(--main-color)]",
                            "text-md",
                            "self-start",
                            "font-semibold",
                          ],
                        },
                        ["Achievements"]
                      ),
                      createElement("div", { class: ["w-full", "gap-2"] }, [
                        createElement(
                          "h5",
                          {
                            class: [
                              "text-[var(--light-grey)]",
                              "text-sm",
                              "self-end",
                            ],
                          },
                          ["22/100"]
                        ),
                        createElement(
                          "div",
                          {
                            class: [
                              "w-full",
                              "bg-white",
                              "rounded-full",
                              "h-2.5",
                              "items-start",
                              "overflow-hidden",
                            ],
                          },
                          [
                            createElement("div", {
                              class: [
                                "bg-[var(--light-yellow)]",
                                "h-2.5",
                                "rounded-full",
                                "transition-all",
                                "duration-1000",
                              ],
                              style: {
                                width: this.state.animationComplete
                                  ? "22%"
                                  : "0%",
                                transitionDelay: "800ms",
                              },
                            }),
                          ]
                        ),
                      ]),
                    ]
                  ),
                ]
              ),
            ]),
      ]
    );
  },
  async handleUnfriendButton(
    this: IComponent<ProfileInterfaceState, ProfileInterfaceProps>
  ) {
    try {
      if (this.state.relationShip === "blocked") {
        await enhancedFetch.fetch(
          `${import.meta.env.VITE_URL_DEV}/api/friends/${this.state.id}/block`,
          {
            method: "DELETE",
          }
        );
      } else {
        await enhancedFetch.fetch(
          `${import.meta.env.VITE_URL_DEV}/api/friends/${this.state.id}/friend`,
          {
            method: "DELETE",
          }
        );
      }
      const relationResponse = await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/friends/${this.state.id}`
      );
      const relation = await relationResponse.json();
      if (this.getIsMounted)
        this.updateState({ relationShip: relation.status });
    } catch (err) {
      console.log(err);
    }
  },
  async handlePlayButton(
    this: IComponent<ProfileInterfaceState, ProfileInterfaceProps>
  ) {
    if (this.state.relationShip === "friend") {
      try {
        await enhancedFetch.fetch(
          `${import.meta.env.VITE_URL_DEV}/api/games/`,
          {
            method: "POST",
            body: JSON.stringify({ playerTwoId: this.state.id }),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        await enhancedFetch.fetch(
          `${import.meta.env.VITE_URL_DEV}/api/friends/${
            this.state.id
          }/request`,
          {
            method: "POST",
          }
        );
      } catch (err) {
        console.log(err);
      }
    }
  },
  async extractData(
    this: IComponent<ProfileInterfaceState, ProfileInterfaceProps>,
    arr: any,
    userid: string
  ) {
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
    if (this.getIsMounted)
      this.updateState({
        gameWin: winnerGames,
        gameLose: loseGames,
        scoreDiffrence: xp >= 0 ? xp : 0,
      });
  },
});

const style = document.createElement("style");
style.innerHTML = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideRight {
    from { 
      opacity: 0;
      transform: translateX(-20px);
    }
    to { 
      opacity: 1;
      transform: translateX(0);
    }
  }
`;
document.head.appendChild(style);

export default ProfileInterface;
