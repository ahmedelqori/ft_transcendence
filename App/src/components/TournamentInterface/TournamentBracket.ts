import {
  createElement,
  defineComponent,
  eventBus,
  IComponent,
} from "@/uccello/Uccello";
import TournamentInvite from "./TournamentInvite";
import enhancedFetch from "@/Hooks/fetch";
import { router } from "@/router/Router";
import { authState } from "@/Hooks/Auth";
import { InviteUserComp, UserCompo } from "./TournamentBracketComponents";
import Loader from "../Loader/Loader";

interface TournamentBracketProps {}

interface TournamentBracketState {
  inviteUsers: boolean;
  isLoading: boolean;
  numberOfPlayers: number;
  firstRound: number;
  players: any[];
  rounds: any[];
  status: string;
  code: string;
  owner: number;
  title: string;
}

const TournamentBracket = defineComponent<
  TournamentBracketState,
  TournamentBracketProps
>({
  async onMounted(
    this: IComponent<TournamentBracketState, TournamentBracketProps> & {
      handleGetTournament: () => Promise<void>;
      handleStartTournament: () => Promise<void>;
      handleChangeParam: () => void;
    }
  ) {
    await this.handleGetTournament();
    eventBus.on("change:tournament", async () => {
      await this.handleGetTournament();
    });
    window.addEventListener("hashchange", this.handleChangeParam);
  },
  onUnMounted(
    this: IComponent<TournamentBracketState> & { handleChangeParam: () => void }
  ) {
    window.removeEventListener("hashchange", this.handleChangeParam);
  },
  state() {
    return {
      inviteUsers: false,
      isLoading: true,
      numberOfPlayers: 4,
      firstRound: 4,
      players: [authState.getState().user?.id!],
      status: "CREATED",
      code: "",
      owner: -1,
      rounds: [],
      title: "",
    };
  },
  render(
    this: IComponent<TournamentBracketState, TournamentBracketProps> & {
      handleLeaveTournament: () => Promise<void>;
      handleStartTournament: () => Promise<void>;
    }
  ) {
    let index = 0;
    return this.state.isLoading == false
      ? createElement(
          "div",
          { class: ["w-full", "h-full", "flex-row", "relative"] },
          [
            (this.state.status === "READY" ||
              this.state.status === "STARTED") &&
            authState.getState().user?.id === this.state.owner
              ? createElement(
                  "div",
                  {
                    class: [
                      "absolute",
                      "left-1/2",
                      "top-1/2",
                      "bg-opacity-1",
                      "-translate-x-1/2",
                      "-translate-y-1/2",
                      "py-2",
                      "text-black",
                      "font-medium",
                      "text-lg",
                      "flex-row",
                    ],
                    on: {
                      click: async () => await this.handleStartTournament(),
                    },
                  },
                  [
                    createElement(
                      "button",
                      {
                        class: [
                          "border-4",
                          "border-[var(--light-yellow)]",
                          "w-[120px]",
                          "bg-[var(--light-yellow)]",
                          "rounded-[33px]",
                          "tracking-wide",
                          "h-12",
                        ],
                      },
                      ["Start"]
                    ),
                  ]
                )
              : this.state.status === "COMPLETE"
              ? createElement(
                  "div",
                  {
                    class: [
                      "absolute",
                      "left-1/2",
                      "top-1/2",
                      "bg-opacity-1",
                      "-translate-x-1/2",
                      "-translate-y-1/2",
                      "py-2",
                      "text-black",
                      "bg-[var(--light-yellow)]",
                      "rounded-[33px]",
                      "font-medium",
                      "flex-row",
                      "scale-[120%]",
                    ],
                    on: {
                      click: async () => await this.handleStartTournament(),
                    },
                  },
                  [
                    createElement(UserCompo, {
                      username: this.state.players.find(
                        (e) =>
                          e.id ==
                          this.state.rounds["round2" as any]?.[0].game.winnerId
                      )?.nickname,
                      id: this.state.rounds["round2" as any]?.[0].game.winnerId,
                      avatar_url: this.state.players.find(
                        (e) =>
                          e.id ==
                          this.state.rounds["round2" as any]?.[0].game.winnerId
                      )?.avatar_url,
                      invert: false,
                    }),
                  ]
                )
              : null,

            createElement(
              "div",
              {
                class: [
                  "absolute",
                  "left-[-26px]",
                  "top-[-41px]",
                  "bg-opacity-1",
                  "py-2",
                  "text-black",
                  "font-medium",
                  "text-lg",
                  "flex-row",
                ],
              },
              [
                createElement(
                  "button",
                  {
                    class: [
                      "rounded-bl-none",
                      "rounded-tr-none",

                      "border-2",
                      "text-[var(--dark-black)]",
                      "w-[120px]",
                      "bg-[var(--main-color)]",
                      "border-[#878787]",
                      "border-opacity-[30%]",
                      "rounded-[33px]",
                      "tracking-wide",
                      "h-12",
                    ],
                  },
                  [`#${this.state.code}`]
                ),
              ]
            ),
            createElement(
              "div",
              {
                class: [
                  "absolute",
                  "left-1/2",
                  "-translate-x-1/2",
                  "top-[-41px]",
                  "bg-opacity-1",
                  "py-2",
                  "text-black",
                  "font-medium",
                  "text-lg",
                  "flex-row",
                ],
              },
              [
                createElement(
                  "button",
                  {
                    class: [
                      "rounded-tl-none",
                      "rounded-tr-none",
                      "border-2",
                      "text-[var(--dark-black)]",
                      "w-[160px]",
                      "bg-[var(--light-yellow)]",
                      "border-[#878787]",
                      "border-opacity-[30%]",
                      "rounded-[33px]",
                      "tracking-wide",
                      "h-12",
                      "text-xl",
                    ],
                  },
                  [`${this.state.title}`]
                ),
              ]
            ),
            this.state.status === "CREATED"
              ? createElement(
                  "div",
                  {
                    class: [
                      "absolute",
                      "right-[-26px]",
                      "top-[-41px]",
                      "bg-opacity-1",
                      "py-2",
                      "text-black",
                      "font-medium",
                      "text-lg",
                      "flex-row",
                    ],
                    on: {
                      click: async () => {
                        await this.handleLeaveTournament();
                        await router.navigateTo("/tournament");
                      },
                    },
                  },
                  [
                    createElement(
                      "button",
                      {
                        class: [
                          "rounded-br-none",
                          "rounded-tl-none",
                          "border-2",
                          "text-[var(--main-color)]",
                          "w-[120px]",
                          "bg-[var(--red-color)]",
                          "border-[#878787]",
                          "border-opacity-[30%]",
                          "rounded-[33px]",
                          "tracking-wide",
                          "h-12",
                        ],
                      },
                      [
                        this.state.owner === authState.getState().user?.id!
                          ? `Delete`
                          : "Leave",
                      ]
                    ),
                  ]
                )
              : this.state.owner === authState.getState().user?.id!
              ? createElement(
                  "div",
                  {
                    class: [
                      "absolute",
                      "right-[-26px]",
                      "top-[-41px]",
                      "bg-opacity-1",
                      "py-2",
                      "text-black",
                      "font-medium",
                      "text-lg",
                      "flex-row",
                    ],
                    on: {
                      click: async () => {
                        await this.handleLeaveTournament();
                        await router.navigateTo("/tournament");
                      },
                    },
                  },
                  [
                    createElement(
                      "button",
                      {
                        class: [
                          "rounded-br-none",
                          "rounded-tl-none",
                          "border-2",
                          "text-[var(--main-color)]",
                          "w-[120px]",
                          "bg-[var(--red-color)]",
                          "border-[#878787]",
                          "border-opacity-[30%]",
                          "rounded-[33px]",
                          "tracking-wide",
                          "h-12",
                        ],
                      },
                      [`Delete`]
                    ),
                  ]
                )
              : null,
            createElement(
              "div",
              {
                class: [
                  "h-full",
                  "w-full",
                  "flex-row",
                  "justify-center",
                  "gap-5",
                ],
              },
              [
                createElement(
                  "div",
                  {
                    class: [
                      "h-full",
                      "gap-5",
                      "justify-around",
                      this.state.numberOfPlayers != 16 ? "blur-sm" : "blur-0",
                      this.state.numberOfPlayers != 16
                        ? "pointer-events-none"
                        : "pointer-events-auto",
                    ],
                  },
                  Array(4)
                    .fill(0)
                    .map((e, i) =>
                      createElement("div", { class: [] }, [
                        createElement(
                          "div",
                          {
                            class: [
                              "w-[150px]",
                              "py-2",
                              "rounded-full",
                              "border-2",
                              "border-[#878787]",
                              "border-opacity-[30%]",
                            ],
                          },
                          [
                            (this.state.status == "CREATED" ||
                              this.state.status == "READY" ||
                              this.state.status == "COMPLETE") &&
                            this.state.numberOfPlayers === 16 &&
                            index++ < this.state.players.length
                              ? createElement(UserCompo, {
                                  username:
                                    this.state.players[index - 1]?.nickname,
                                  id: this.state.players[index - 1]?.id,
                                  avatar_url:
                                    this.state.players[index - 1]?.avatar_url,
                                  invert: false,
                                })
                              : (this.state.status == "CREATED" ||
                                  this.state.status == "READY" ||
                                  this.state.status == "COMPLETE") &&
                                this.state.numberOfPlayers !== 16
                              ? createElement(
                                  "div",
                                  { class: ["text-[var(--light-grey)]"] },
                                  ["Round 8"]
                                )
                              : createElement(InviteUserComp, {
                                  updateInviteUsers: () => {
                                    this.updateState({
                                      inviteUsers: !this.state.inviteUsers,
                                    });
                                  },
                                  index: index,
                                }),
                          ]
                        ),
                        createElement(
                          "div",
                          {
                            class: [
                              "h-9",
                              "w-[2px]",
                              "bg-[#878787]",
                              "opacity-[30%]",
                              "relative",
                              "after:absolute",
                              "after:w-[170px]",
                              "after:top-[50%]",
                              "after:left-[50%]",
                              "after:h-[2px]",
                              "after:bg-[#878787]",
                              "after:content-['']",
                            ],
                          },
                          [""]
                        ),
                        createElement(
                          "div",
                          {
                            class: [
                              "w-[150px]",
                              "py-2",
                              "rounded-full",
                              "border-2",
                              "border-[#878787]",
                              "border-opacity-[30%]",
                            ],
                          },
                          [
                            (this.state.status == "CREATED" ||
                              this.state.status == "READY" ||
                              this.state.status == "COMPLETE") &&
                            this.state.numberOfPlayers === 16 &&
                            index++ < this.state.players.length
                              ? createElement(UserCompo, {
                                  username:
                                    this.state.players[index - 1]?.nickname,
                                  id: this.state.players[index - 1]?.id,
                                  avatar_url:
                                    this.state.players[index - 1]?.avatar_url,
                                  invert: false,
                                })
                              : (this.state.status == "CREATED" ||
                                  this.state.status == "READY" ||
                                  this.state.status == "COMPLETE") &&
                                this.state.numberOfPlayers !== 16
                              ? createElement(
                                  "div",
                                  { class: ["text-[var(--light-grey)]"] },
                                  ["Round 8"]
                                )
                              : createElement(InviteUserComp, {
                                  updateInviteUsers: () => {
                                    this.updateState({
                                      inviteUsers: !this.state.inviteUsers,
                                    });
                                  },
                                  index: index,
                                }),
                          ]
                        ),
                      ])
                    )
                ),
                createElement(
                  "div",
                  {
                    class: [
                      "h-full",
                      "gap-5",
                      "justify-around",
                      this.state.numberOfPlayers == 4 ? "blur-sm" : "blur-0",
                      this.state.numberOfPlayers == 4
                        ? "pointer-events-none"
                        : "pointer-events-auto",
                    ],
                  },
                  Array(2)
                    .fill(0)
                    .map((e) =>
                      createElement("div", { class: [] }, [
                        createElement(
                          "div",
                          {
                            class: [
                              "w-[150px]",
                              "py-2",
                              "rounded-full",
                              "border-2",
                              "border-[#878787]",
                              "border-opacity-[30%]",
                              "relative",
                              "after:opacity-[30%]",
                              "after:absolute",
                              "after:w-[2px]",
                              "after:bottom-[100%]",
                              "after:left-[50%]",
                              "after:h-[35px]",
                              "after:bg-[#878787]",
                              "after:content-['']",
                            ],
                          },
                          [
                            (this.state.status == "CREATED" ||
                              this.state.status == "READY" ||
                              this.state.status == "COMPLETE") &&
                            this.state.numberOfPlayers === 8 &&
                            index++ < this.state.players.length
                              ? createElement(UserCompo, {
                                  username:
                                    this.state.players[index - 1]?.nickname,
                                  id: this.state.players[index - 1]?.id,
                                  avatar_url:
                                    this.state.players[index - 1]?.avatar_url,
                                  invert: false,
                                })
                              : (this.state.status == "CREATED" ||
                                  this.state.status == "READY" ||
                                  this.state.status == "COMPLETE") &&
                                this.state.numberOfPlayers !== 8
                              ? createElement(
                                  "div",
                                  { class: ["text-[var(--light-grey)]"] },
                                  ["Round 4"]
                                )
                              : createElement(InviteUserComp, {
                                  updateInviteUsers: () => {
                                    this.updateState({
                                      inviteUsers: !this.state.inviteUsers,
                                    });
                                  },
                                  index: index,
                                }),
                          ]
                        ),
                        createElement(
                          "div",
                          {
                            class: [
                              "h-9",
                              "w-[2px]",
                              "bg-[#878787]",
                              "opacity-[30%]",
                              "relative",
                              "after:absolute",
                              "after:w-[170px]",
                              "after:top-[50%]",
                              "after:left-[50%]",
                              "after:h-[2px]",
                              "after:bg-[#878787]",
                              "after:content-['']",
                            ],
                          },
                          [""]
                        ),
                        createElement(
                          "div",
                          {
                            class: [
                              "w-[150px]",
                              "py-2",
                              "rounded-full",
                              "border-2",
                              "border-[#878787]",
                              "border-opacity-[30%]",
                              "relative",
                              "after:opacity-[30%]",
                              "after:absolute",
                              "after:w-[2px]",
                              "after:top-[100%]",
                              "after:left-[50%]",
                              "after:h-[35px]",
                              "after:bg-[#878787]",
                              "after:content-['']",
                            ],
                          },
                          [
                            (this.state.status == "CREATED" ||
                              this.state.status == "READY" ||
                              this.state.status == "COMPLETE") &&
                            this.state.numberOfPlayers === 8 &&
                            index++ < this.state.players.length
                              ? createElement(UserCompo, {
                                  username:
                                    this.state.players[index - 1]?.nickname,
                                  id: this.state.players[index - 1]?.id,
                                  avatar_url:
                                    this.state.players[index - 1]?.avatar_url,
                                  invert: false,
                                })
                              : (this.state.status == "CREATED" ||
                                  this.state.status == "READY" ||
                                  this.state.status == "COMPLETE") &&
                                this.state.numberOfPlayers !== 8
                              ? createElement(
                                  "div",
                                  { class: ["text-[var(--light-grey)]"] },
                                  ["Round 4"]
                                )
                              : createElement(InviteUserComp, {
                                  updateInviteUsers: () => {
                                    this.updateState({
                                      inviteUsers: !this.state.inviteUsers,
                                    });
                                  },
                                  index: index,
                                }),
                          ]
                        ),
                      ])
                    )
                ),
                createElement(
                  "div",
                  { class: ["h-full", "gap-5", "justify-around"] },
                  Array(1)
                    .fill(0)
                    .map((e, i) =>
                      createElement("div", { class: [] }, [
                        createElement(
                          "div",
                          {
                            class: [
                              "w-[150px]",
                              "py-2",
                              "rounded-full",
                              "border-2",
                              "border-[#878787]",
                              "border-opacity-[30%]",
                              "relative",
                              "after:opacity-[30%]",
                              "after:absolute",
                              "after:w-[2px]",
                              "after:bottom-[100%]",
                              "after:left-[50%]",
                              "after:h-[130px]",
                              "after:bg-[#878787]",
                              "after:content-['']",
                            ],
                          },
                          [
                            this.state.status == "STARTED" &&
                            this.state.numberOfPlayers == 4
                              ? createElement(UserCompo, {
                                  username: this.state.players.find(
                                    (e) =>
                                      e.id ==
                                      this.state.rounds["round4" as any]?.[i]
                                        .game.playerOneId
                                  )?.nickname,
                                  id: this.state.rounds["round4" as any]?.[i]
                                    .game.playerOneId,
                                  avatar_url: this.state.players.find(
                                    (e) =>
                                      e.id ==
                                      this.state.rounds["round4" as any]?.[i]
                                        .game.playerOneId
                                  )?.avatar_url,
                                  invert: false,
                                })
                              : (this.state.status == "CREATED" ||
                                  this.state.status == "READY" ||
                                  this.state.status == "COMPLETE") &&
                                this.state.numberOfPlayers === 4 &&
                                index++ < this.state.players.length
                              ? createElement(UserCompo, {
                                  username:
                                    this.state.players[index - 1]?.nickname,
                                  id: this.state.players[index - 1]?.id,
                                  avatar_url:
                                    this.state.players[index - 1]?.avatar_url,
                                  invert: false,
                                })
                              : (this.state.status == "CREATED" ||
                                  this.state.status == "READY" ||
                                  this.state.status == "COMPLETE") &&
                                this.state.numberOfPlayers !== 4
                              ? createElement(
                                  "div",
                                  { class: ["text-[var(--light-grey)]"] },
                                  ["Round 2"]
                                )
                              : createElement(InviteUserComp, {
                                  updateInviteUsers: () => {
                                    this.updateState({
                                      inviteUsers: !this.state.inviteUsers,
                                    });
                                  },
                                  index: index,
                                }),
                          ]
                        ),
                        createElement(
                          "div",
                          {
                            class: [
                              "h-9",
                              "w-[2px]",
                              "bg-[#878787]",
                              "opacity-[30%]",
                              "relative",
                              "after:absolute",
                              "after:w-[96px]",
                              "after:top-[50%]",
                              "after:left-[50%]",
                              "after:h-[2px]",
                              "after:bg-[#878787]",
                              "after:content-['']",
                            ],
                          },
                          [""]
                        ),
                        createElement(
                          "div",
                          {
                            class: [
                              "w-[150px]",
                              "py-2",
                              "rounded-full",
                              "border-2",
                              "border-[#878787]",
                              "border-opacity-[30%]",
                              "relative",
                              "after:opacity-[30%]",
                              "after:absolute",
                              "after:w-[2px]",
                              "after:top-[100%]",
                              "after:left-[50%]",
                              "after:h-[132px]",
                              "after:bg-[#878787]",
                              "after:content-['']",
                            ],
                          },
                          [
                            this.state.status == "STARTED" &&
                            this.state.numberOfPlayers == 4
                              ? createElement(UserCompo, {
                                  username: this.state.players.find(
                                    (e) =>
                                      e.id ==
                                      this.state.rounds["round4" as any]?.[i]
                                        .game.playerTwoId
                                  )?.nickname,
                                  id: this.state.rounds["round4" as any]?.[i]
                                    .game.playerTwo,
                                  avatar_url: this.state.players.find(
                                    (e) =>
                                      e.id ==
                                      this.state.rounds["round4" as any]?.[i]
                                        .game.playerTwoId
                                  )?.avatar_url,
                                  invert: false,
                                })
                              : (this.state.status == "CREATED" ||
                                  this.state.status == "READY" ||
                                  this.state.status == "COMPLETE") &&
                                this.state.numberOfPlayers === 4 &&
                                index++ < this.state.players.length
                              ? createElement(UserCompo, {
                                  username:
                                    this.state.players[index - 1]?.nickname,
                                  id: this.state.players[index - 1]?.id,
                                  avatar_url:
                                    this.state.players[index - 1]?.avatar_url,
                                  invert: false,
                                })
                              : (this.state.status == "CREATED" ||
                                  this.state.status == "READY" ||
                                  this.state.status == "COMPLETE") &&
                                this.state.numberOfPlayers !== 4
                              ? createElement(
                                  "div",
                                  { class: ["text-[var(--light-grey)]"] },
                                  ["Round 2"]
                                )
                              : createElement(InviteUserComp, {
                                  updateInviteUsers: () => {
                                    this.updateState({
                                      inviteUsers: !this.state.inviteUsers,
                                    });
                                  },
                                  index: index,
                                }),
                          ]
                        ),
                      ])
                    )
                ),
                createElement("div", { class: [] }, [
                  createElement(
                    "div",
                    {
                      class: [
                        "w-[150px]",
                        "py-2",
                        "rounded-full",
                        "border-2",
                        "border-[#878787]",
                        "border-opacity-[30%]",
                      ],
                    },
                    [
                      createElement(
                        "div",
                        { class: ["text-[var(--light-grey)]"] },
                        [
                          (this.state.status == "STARTED" ||
                            this.state.status == "COMPLETE") &&
                          this.state.rounds["round4" as any][0].game.status ==
                            "FINISHED"
                            ? createElement(UserCompo, {
                                username: this.state.players.find(
                                  (e) =>
                                    e.id ==
                                    this.state.rounds["round4" as any][0].game
                                      .winnerId
                                )?.nickname,
                                id: this.state.rounds["round4" as any][0].game
                                  .winnerId,
                                avatar_url: this.state.players.find(
                                  (e) =>
                                    e.id ==
                                    this.state.rounds["round4" as any][0].game
                                      .winnerId
                                )?.avatar_url,
                                invert: false,
                              })
                            : "Final",
                        ]
                      ),
                    ]
                  ),
                ]),
              ]
            ),
            this.state.status !== "COMPLETE"
              ? createElement("h4", { class: ["text-3xl"] }, ["Vs"])
              : null,
            createElement(
              "div",
              {
                class: [
                  "h-full",
                  "w-full",
                  "flex-row",
                  "justify-center",
                  "gap-5",
                  "scale-x-[-1]",
                ],
              },
              [
                createElement(
                  "div",
                  {
                    class: [
                      "h-full",
                      "gap-5",
                      "justify-around",
                      this.state.numberOfPlayers != 16 ? "blur-sm" : "blur-0",
                      this.state.numberOfPlayers != 16
                        ? "pointer-events-none"
                        : "pointer-events-auto",
                    ],
                  },
                  Array(4)
                    .fill(0)
                    .map((e) =>
                      createElement("div", { class: [] }, [
                        createElement(
                          "div",
                          {
                            class: [
                              "w-[150px]",
                              "py-2",
                              "rounded-full",
                              "border-2",
                              "border-[#878787]",
                              "border-opacity-[30%]",
                            ],
                          },
                          [
                            (this.state.status == "CREATED" ||
                              this.state.status == "READY" ||
                              this.state.status == "COMPLETE") &&
                            this.state.numberOfPlayers === 16 &&
                            index++ < this.state.players.length
                              ? createElement(UserCompo, {
                                  username:
                                    this.state.players[index - 1]?.nickname,
                                  id: this.state.players[index - 1]?.id,
                                  avatar_url:
                                    this.state.players[index - 1]?.avatar_url,
                                  invert: true,
                                })
                              : (this.state.status == "CREATED" ||
                                  this.state.status == "READY" ||
                                  this.state.status == "COMPLETE") &&
                                this.state.numberOfPlayers !== 16
                              ? createElement(
                                  "div",
                                  {
                                    class: [
                                      "text-[var(--light-grey)]",
                                      "scale-x-[-1]",
                                    ],
                                  },
                                  ["Round 8"]
                                )
                              : createElement(InviteUserComp, {
                                  updateInviteUsers: () => {
                                    this.updateState({
                                      inviteUsers: !this.state.inviteUsers,
                                    });
                                  },
                                  index: index,
                                }),
                          ]
                        ),
                        createElement(
                          "div",
                          {
                            class: [
                              "h-9",
                              "w-[2px]",
                              "bg-[#878787]",
                              "opacity-[30%]",
                              "relative",
                              "after:absolute",
                              "after:w-[170px]",
                              "after:top-[50%]",
                              "after:left-[50%]",
                              "after:h-[2px]",
                              "after:bg-[#878787]",
                              "after:content-['']",
                            ],
                          },
                          [""]
                        ),
                        createElement(
                          "div",
                          {
                            class: [
                              "w-[150px]",
                              "py-2",
                              "rounded-full",
                              "border-2",
                              "border-[#878787]",
                              "border-opacity-[30%]",
                            ],
                          },
                          [
                            (this.state.status == "CREATED" ||
                              this.state.status == "READY" ||
                              this.state.status == "COMPLETE") &&
                            this.state.numberOfPlayers === 16 &&
                            index++ < this.state.players.length
                              ? createElement(UserCompo, {
                                  username:
                                    this.state.players[index - 1]?.nickname,
                                  id: this.state.players[index - 1]?.id,
                                  avatar_url:
                                    this.state.players[index - 1]?.avatar_url,
                                  invert: true,
                                })
                              : (this.state.status == "CREATED" ||
                                  this.state.status == "READY" ||
                                  this.state.status == "COMPLETE") &&
                                this.state.numberOfPlayers !== 16
                              ? createElement(
                                  "div",
                                  {
                                    class: [
                                      "text-[var(--light-grey)]",
                                      "scale-x-[-1]",
                                    ],
                                  },
                                  ["Round 8"]
                                )
                              : createElement(InviteUserComp, {
                                  updateInviteUsers: () => {
                                    this.updateState({
                                      inviteUsers: !this.state.inviteUsers,
                                    });
                                  },
                                  index: index,
                                }),
                          ]
                        ),
                      ])
                    )
                ),
                createElement(
                  "div",
                  {
                    class: [
                      "h-full",
                      "gap-5",
                      "justify-around",
                      this.state.numberOfPlayers == 4 ? "blur-sm" : "blur-0",
                      this.state.numberOfPlayers == 4
                        ? "pointer-events-none"
                        : "pointer-events-auto",
                    ],
                  },
                  Array(2)
                    .fill(0)
                    .map((e) =>
                      createElement("div", { class: [] }, [
                        createElement(
                          "div",
                          {
                            class: [
                              "w-[150px]",
                              "py-2",
                              "rounded-full",
                              "border-2",
                              "border-[#878787]",
                              "border-opacity-[30%]",
                              "relative",
                              "after:opacity-[30%]",
                              "after:absolute",
                              "after:w-[2px]",
                              "after:bottom-[100%]",
                              "after:left-[50%]",
                              "after:h-[35px]",
                              "after:bg-[#878787]",
                              "after:content-['']",
                            ],
                          },
                          [
                            (this.state.status == "CREATED" ||
                              this.state.status == "READY" ||
                              this.state.status == "COMPLETE") &&
                            this.state.numberOfPlayers === 8 &&
                            index++ < this.state.players.length
                              ? createElement(UserCompo, {
                                  username:
                                    this.state.players[index - 1]?.nickname,
                                  id: this.state.players[index - 1]?.id,
                                  avatar_url:
                                    this.state.players[index - 1]?.avatar_url,
                                  invert: true,
                                })
                              : (this.state.status == "CREATED" ||
                                  this.state.status == "READY" ||
                                  this.state.status == "COMPLETE") &&
                                this.state.numberOfPlayers !== 8
                              ? createElement(
                                  "div",
                                  {
                                    class: [
                                      "text-[var(--light-grey)]",
                                      "scale-x-[-1]",
                                    ],
                                  },
                                  ["Round 4"]
                                )
                              : createElement(InviteUserComp, {
                                  updateInviteUsers: () => {
                                    this.updateState({
                                      inviteUsers: !this.state.inviteUsers,
                                    });
                                  },
                                  index: index,
                                }),
                          ]
                        ),
                        createElement(
                          "div",
                          {
                            class: [
                              "h-9",
                              "w-[2px]",
                              "bg-[#878787]",
                              "opacity-[30%]",
                              "relative",
                              "after:absolute",
                              "after:w-[170px]",
                              "after:top-[50%]",
                              "after:left-[50%]",
                              "after:h-[2px]",
                              "after:bg-[#878787]",
                              "after:content-['']",
                            ],
                          },
                          [""]
                        ),
                        createElement(
                          "div",
                          {
                            class: [
                              "w-[150px]",
                              "py-2",
                              "rounded-full",
                              "border-2",
                              "border-[#878787]",
                              "border-opacity-[30%]",
                              "relative",
                              "after:opacity-[30%]",
                              "after:absolute",
                              "after:w-[2px]",
                              "after:top-[100%]",
                              "after:left-[50%]",
                              "after:h-[35px]",
                              "after:bg-[#878787]",
                              "after:content-['']",
                            ],
                          },
                          [
                            (this.state.status == "CREATED" ||
                              this.state.status == "READY" ||
                              this.state.status == "COMPLETE") &&
                            this.state.numberOfPlayers === 8 &&
                            index++ < this.state.players.length
                              ? createElement(UserCompo, {
                                  username:
                                    this.state.players[index - 1]?.nickname,
                                  id: this.state.players[index - 1]?.id,
                                  avatar_url:
                                    this.state.players[index - 1]?.avatar_url,
                                  invert: true,
                                })
                              : (this.state.status == "CREATED" ||
                                  this.state.status == "READY" ||
                                  this.state.status == "COMPLETE") &&
                                this.state.numberOfPlayers !== 8
                              ? createElement(
                                  "div",
                                  {
                                    class: [
                                      "text-[var(--light-grey)]",
                                      "scale-x-[-1]",
                                    ],
                                  },
                                  ["Round 4"]
                                )
                              : createElement(InviteUserComp, {
                                  updateInviteUsers: () => {
                                    this.updateState({
                                      inviteUsers: !this.state.inviteUsers,
                                    });
                                  },
                                  index: index,
                                }),
                          ]
                        ),
                      ])
                    )
                ),
                createElement(
                  "div",
                  { class: ["h-full", "gap-5", "justify-around"] },
                  Array(1)
                    .fill(0)
                    .map((e, i) =>
                      createElement("div", { class: [] }, [
                        createElement(
                          "div",
                          {
                            class: [
                              "w-[150px]",
                              "py-2",
                              "rounded-full",
                              "border-2",
                              "border-[#878787]",
                              "border-opacity-[30%]",
                              "relative",
                              "after:opacity-[30%]",
                              "after:absolute",
                              "after:w-[2px]",
                              "after:bottom-[100%]",
                              "after:left-[50%]",
                              "after:h-[130px]",
                              "after:bg-[#878787]",
                              "after:content-['']",
                            ],
                          },
                          [
                            this.state.status == "STARTED" &&
                            this.state.numberOfPlayers == 4
                              ? createElement(UserCompo, {
                                  username: this.state.players.find(
                                    (e) =>
                                      e.id ==
                                      this.state.rounds["round4" as any]?.[1]
                                        .game.playerOneId
                                  )?.nickname,
                                  id: this.state.rounds["round4" as any]?.[1]
                                    .game.playerOneId,
                                  avatar_url: this.state.players.find(
                                    (e) =>
                                      e.id ==
                                      this.state.rounds["round4" as any]?.[1]
                                        .game.playerOneId
                                  )?.avatar_url,
                                  invert: true,
                                })
                              : (this.state.status == "CREATED" ||
                                  this.state.status == "READY" ||
                                  this.state.status == "COMPLETE") &&
                                this.state.numberOfPlayers === 4 &&
                                index++ < this.state.players.length
                              ? createElement(UserCompo, {
                                  username:
                                    this.state.players[index - 1]?.nickname,
                                  id: this.state.players[index - 1]?.id,
                                  avatar_url:
                                    this.state.players[index - 1]?.avatar_url,
                                  invert: true,
                                })
                              : (this.state.status == "CREATED" ||
                                  this.state.status == "READY" ||
                                  this.state.status == "COMPLETE") &&
                                this.state.numberOfPlayers !== 4
                              ? createElement(
                                  "div",
                                  {
                                    class: [
                                      "text-[var(--light-grey)]",
                                      "scale-x-[-1]",
                                    ],
                                  },
                                  ["Round 2"]
                                )
                              : createElement(InviteUserComp, {
                                  updateInviteUsers: () => {
                                    this.updateState({
                                      inviteUsers: !this.state.inviteUsers,
                                    });
                                  },
                                  index: index,
                                }),
                          ]
                        ),
                        createElement(
                          "div",
                          {
                            class: [
                              "h-9",
                              "w-[2px]",
                              "bg-[#878787]",
                              "opacity-[30%]",
                              "relative",
                              "after:absolute",
                              "after:w-[96px]",
                              "after:top-[50%]",
                              "after:left-[50%]",
                              "after:h-[2px]",
                              "after:bg-[#878787]",
                              "after:content-['']",
                            ],
                          },
                          [""]
                        ),
                        createElement(
                          "div",
                          {
                            class: [
                              "w-[150px]",
                              "py-2",
                              "rounded-full",
                              "border-2",
                              "border-[#878787]",
                              "border-opacity-[30%]",
                              "relative",
                              "after:opacity-[30%]",
                              "after:absolute",
                              "after:w-[2px]",
                              "after:top-[100%]",
                              "after:left-[50%]",
                              "after:h-[132px]",
                              "after:bg-[#878787]",
                              "after:content-['']",
                            ],
                          },
                          [
                            this.state.status == "STARTED" &&
                            this.state.numberOfPlayers == 4
                              ? createElement(UserCompo, {
                                  username: this.state.players.find(
                                    (e) =>
                                      e.id ==
                                      this.state.rounds["round4" as any]?.[1]
                                        .game.playerTwoId
                                  )?.nickname,
                                  id: this.state.rounds["round4" as any]?.[1]
                                    .game.playerTwoId,
                                  avatar_url: this.state.players.find(
                                    (e) =>
                                      e.id ==
                                      this.state.rounds["round4" as any]?.[1]
                                        .game.playerTwoId
                                  )?.avatar_url,
                                  invert: true,
                                })
                              : (this.state.status == "CREATED" ||
                                  this.state.status == "READY" ||
                                  this.state.status == "COMPLETE") &&
                                this.state.numberOfPlayers === 4 &&
                                index++ < this.state.players.length
                              ? createElement(UserCompo, {
                                  username:
                                    this.state.players[index - 1]?.nickname,
                                  id: this.state.players[index - 1]?.id,
                                  avatar_url:
                                    this.state.players[index - 1]?.avatar_url,
                                  invert: true,
                                })
                              : (this.state.status == "CREATED" ||
                                  this.state.status == "READY" ||
                                  this.state.status == "COMPLETE") &&
                                this.state.numberOfPlayers !== 4
                              ? createElement(
                                  "div",
                                  {
                                    class: [
                                      "text-[var(--light-grey)]",
                                      "scale-x-[-1]",
                                    ],
                                  },
                                  ["Round 2"]
                                )
                              : createElement(InviteUserComp, {
                                  updateInviteUsers: () => {
                                    this.updateState({
                                      inviteUsers: !this.state.inviteUsers,
                                    });
                                  },
                                  index: index,
                                }),
                          ]
                        ),
                      ])
                    )
                ),
                createElement("div", { class: [] }, [
                  createElement(
                    "div",
                    {
                      class: [
                        "w-[150px]",
                        "py-2",
                        "rounded-full",
                        "border-2",
                        "border-[#878787]",
                        "border-opacity-[30%]",
                        // "scale-x-[-1]",
                      ],
                    },
                    [
                      createElement(
                        "div",
                        { class: ["text-[var(--light-grey)]"] },
                        [
                          (this.state.status == "STARTED" ||
                            this.state.status == "COMPLETE") &&
                          this.state.rounds["round4" as any][1].game.status ==
                            "FINISHED"
                            ? createElement(UserCompo, {
                                username: this.state.players.find(
                                  (e) =>
                                    e.id ==
                                    this.state.rounds["round4" as any][1].game
                                      .winnerId
                                )?.nickname,
                                id: this.state.rounds["round4" as any][1].game
                                  .winnerId,
                                avatar_url: this.state.players.find(
                                  (e) =>
                                    e.id ==
                                    this.state.rounds["round4" as any][1].game
                                      .winnerId
                                )?.avatar_url,
                                invert: true,
                              })
                            : createElement(
                                "div",
                                { class: ["scale-x-[-1]"] },
                                ["Final"]
                              ),
                        ]
                      ),
                    ]
                  ),
                ]),
              ]
            ),
            this.state.inviteUsers
              ? createElement(TournamentInvite, {
                  class: [],
                  inviteUsers: this.state.inviteUsers,
                  tournamentId: (router.getParams as any).id,
                  players: this.state.players,
                  setInviteUsers: () => {
                    this.updateState({ inviteUsers: !this.state.inviteUsers });
                  },
                })
              : null,
          ]
        )
      : createElement(Loader);
  },
  handleChangeParam() {
    if (router.getMatchedRoute?.path === "/tournament/:id")
      eventBus.emit("change:tournament");
  },
  async handleStartTournament() {
    try {
      await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/tournament/${
          (router.getParams as any).id
        }/start`,
        {
          method: "POST",
        }
      );
    } catch (err) {
      console.log(err);
    }
  },
  async handleLeaveTournament() {
    try {
      await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/tournament/${
          (router.getParams as any).id
        }/leave`,
        {
          method: "POST",
        }
      );
    } catch (err) {
      console.log(err);
    }
  },
  async handleGetTournament() {
    try {
      const settingResponse = await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/tournament/${
          (router.getParams as any).id
        }`
      );
      const setting = await settingResponse.json();
      if (!settingResponse.ok) throw setting;
      const resultResponse = await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/tournament/${
          (router.getParams as any).id
        }/results`
      );

      const result = await resultResponse.json();
      console.log(result, setting);
      if (!resultResponse.ok) throw result;
      if (this.getIsMounted) {
        this.updateState({
          numberOfPlayers: setting.total_places,
          firstRound: result.first_round,
          players: result.players,
          isLoading: false,
          status: setting.status,
          code: setting.settings.code,
          owner: setting.owner.id,
          rounds: result.rounds,
          title: setting.name,
        });
      }
    } catch (err: any) {
      eventBus.emit("notif:error", err.error || err.message);
      await router.navigateTo("/tournament");
    }
  },
});

export default TournamentBracket;
