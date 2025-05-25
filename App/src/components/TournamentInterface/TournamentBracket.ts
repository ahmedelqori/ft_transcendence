import {
  createElement,
  createString,
  defineComponent,
  IComponent,
} from "@/uccello/Uccello";
import TournamentInvite from "./TournamentInvite";
import enhancedFetch from "@/Hooks/fetch";
import { router } from "@/router/Router";
import { authState } from "@/Hooks/Auth";
import { InviteUserComp, UserCompo } from "./TournamentBracketComponents";

interface TournamentBracketProps {
  number: number;
}

interface TournamentBracketState {
  inviteUsers: boolean;
  isLoading: boolean;
  numberOfPlayers: number;
  firstRound: number;
  players: any[];
  status: string;
  code: string;
}

const TournamentBracket = defineComponent<
  TournamentBracketState,
  TournamentBracketProps
>({
  async onMounted(
    this: IComponent<TournamentBracketState, TournamentBracketProps>
  ) {
    try {
      const settingResponse = await enhancedFetch.fetch(
        `https://www.meedivo.me/api/tournament/${(router.getParams as any).id}`
      );
      const setting = await settingResponse.json();
      const resultResponse = await enhancedFetch.fetch(
        `https://www.meedivo.me/api/tournament/${
          (router.getParams as any).id
        }/results`
      );
      const result = await resultResponse.json();
      if (this.getIsMounted) {
        this.updateState({
          numberOfPlayers: setting.total_places,
          firstRound: result.first_round,
          players: result.players,
          isLoading: false,
          status: setting.status,
          code: setting.settings.code,
        });
      }
      console.log(this.state.players, setting);
    } catch (err) {
      console.log(err);
    }
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
    };
  },
  render(this: IComponent<TournamentBracketState, TournamentBracketProps>) {
    let index = 0;
    return this.state.isLoading == false
      ? createElement(
          "div",
          { class: ["w-full", "h-full", "flex-row", "relative"] },
          [
            createElement(
              "div",
              {
                class: [
                  "absolute",
                  "top-[-32px]",
                  "left-1/2",
                  "w-[160px]",
                  "bg-[var(--light-yellow)]",
                  "bg-opacity-1",
                  "-translate-x-1/2",
                  "py-2",
                  "text-black",
                  "font-medium",
                  "rounded-bl-[33px]",
                  "rounded-br-[33px]",
                  "tracking-wide",
                  "text-lg",
                ],
              },
              [`#${this.state.code}`]
            ),
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
                            this.state.status == "CREATED" &&
                            this.state.numberOfPlayers === 16 &&
                            index++ < this.state.players.length
                              ? createElement(UserCompo, {
                                  username:
                                    this.state.players[index - 1]?.username,
                                  id: this.state.players[index - 1]?.id,
                                  avatar_url:
                                    this.state.players[index - 1]?.avatar_url,
                                  invert: false,
                                })
                              : this.state.status == "CREATED" &&
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
                            this.state.status == "CREATED" &&
                            this.state.numberOfPlayers === 16 &&
                            index++ < this.state.players.length
                              ? createElement(UserCompo, {
                                  username:
                                    this.state.players[index - 1]?.username,
                                  id: this.state.players[index - 1]?.id,
                                  avatar_url:
                                    this.state.players[index - 1]?.avatar_url,
                                  invert: false,
                                })
                              : this.state.status == "CREATED" &&
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
                            this.state.status == "CREATED" &&
                            this.state.numberOfPlayers === 8 &&
                            index++ < this.state.players.length
                              ? createElement(UserCompo, {
                                  username:
                                    this.state.players[index - 1]?.username,
                                  id: this.state.players[index - 1]?.id,
                                  avatar_url:
                                    this.state.players[index - 1]?.avatar_url,
                                  invert: false,
                                })
                              : this.state.status == "CREATED" &&
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
                            this.state.status == "CREATED" &&
                            this.state.numberOfPlayers === 8 &&
                            index++ < this.state.players.length
                              ? createElement(UserCompo, {
                                  username:
                                    this.state.players[index - 1]?.username,
                                  id: this.state.players[index - 1]?.id,
                                  avatar_url:
                                    this.state.players[index - 1]?.avatar_url,
                                  invert: false,
                                })
                              : this.state.status == "CREATED" &&
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
                              "after:h-[130px]",
                              "after:bg-[#878787]",
                              "after:content-['']",
                            ],
                          },
                          [
                            this.state.status == "CREATED" &&
                            this.state.numberOfPlayers === 4 &&
                            index++ < this.state.players.length
                              ? createElement(UserCompo, {
                                  username:
                                    this.state.players[index - 1]?.username,
                                  id: this.state.players[index - 1]?.id,
                                  avatar_url:
                                    this.state.players[index - 1]?.avatar_url,
                                  invert: false,
                                })
                              : this.state.status == "CREATED" &&
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
                            this.state.firstRound ===
                              this.state.numberOfPlayers &&
                            index++ < this.state.players.length
                              ? createElement(UserCompo, {
                                  username:
                                    this.state.players[index - 1]?.username,
                                  id: this.state.players[index - 1]?.id,
                                  avatar_url:
                                    this.state.players[index - 1]?.avatar_url,
                                  invert: false,
                                })
                              : this.state.numberOfPlayers != 4
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
                        ["Final"]
                      ),
                    ]
                  ),
                ]),
              ]
            ),
            createElement("h4", { class: ["text-3xl"] }, ["Vs"]),
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
                            this.state.status == "CREATED" &&
                            this.state.numberOfPlayers === 16 &&
                            index++ < this.state.players.length
                              ? createElement(UserCompo, {
                                  username:
                                    this.state.players[index - 1]?.username,
                                  id: this.state.players[index - 1]?.id,
                                  avatar_url:
                                    this.state.players[index - 1]?.avatar_url,
                                  invert: true,
                                })
                              : this.state.status == "CREATED" &&
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
                            this.state.status == "CREATED" &&
                            this.state.numberOfPlayers === 16 &&
                            index++ < this.state.players.length
                              ? createElement(UserCompo, {
                                  username:
                                    this.state.players[index - 1]?.username,
                                  id: this.state.players[index - 1]?.id,
                                  avatar_url:
                                    this.state.players[index - 1]?.avatar_url,
                                  invert: true,
                                })
                              : this.state.status == "CREATED" &&
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
                            this.state.status == "CREATED" &&
                            this.state.numberOfPlayers === 8 &&
                            index++ < this.state.players.length
                              ? createElement(UserCompo, {
                                  username:
                                    this.state.players[index - 1]?.username,
                                  id: this.state.players[index - 1]?.id,
                                  avatar_url:
                                    this.state.players[index - 1]?.avatar_url,
                                  invert: true,
                                })
                              : this.state.status == "CREATED" &&
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
                            this.state.status == "CREATED" &&
                            this.state.numberOfPlayers === 8 &&
                            index++ < this.state.players.length
                              ? createElement(UserCompo, {
                                  username:
                                    this.state.players[index - 1]?.username,
                                  id: this.state.players[index - 1]?.id,
                                  avatar_url:
                                    this.state.players[index - 1]?.avatar_url,
                                  invert: true,
                                })
                              : this.state.status == "CREATED" &&
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
                              "after:h-[130px]",
                              "after:bg-[#878787]",
                              "after:content-['']",
                            ],
                          },
                          [
                            this.state.status == "CREATED" &&
                            this.state.numberOfPlayers === 4 &&
                            index++ < this.state.players.length
                              ? createElement(UserCompo, {
                                  username:
                                    this.state.players[index - 1]?.username,
                                  id: this.state.players[index - 1]?.id,
                                  avatar_url:
                                    this.state.players[index - 1]?.avatar_url,
                                  invert: true,
                                })
                              : this.state.status == "CREATED" &&
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
                            this.state.status == "CREATED" &&
                            this.state.numberOfPlayers === 4 &&
                            index++ < this.state.players.length
                              ? createElement(UserCompo, {
                                  username:
                                    this.state.players[index - 1]?.username,
                                  id: this.state.players[index - 1]?.id,
                                  avatar_url:
                                    this.state.players[index - 1]?.avatar_url,
                                  invert: true,
                                })
                              : this.state.status == "CREATED" &&
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
                        "scale-x-[-1]",
                      ],
                    },
                    [
                      createElement(
                        "div",
                        { class: ["text-[var(--light-grey)]"] },
                        ["Final"]
                      ),
                    ]
                  ),
                ]),
              ]
            ),
            createElement(TournamentInvite, {
              class: [],
              inviteUsers: this.state.inviteUsers,
              setInviteUsers: () => {
                this.updateState({ inviteUsers: !this.state.inviteUsers });
              },
            }),
          ]
        )
      : createElement(
          "div",
          {
            class: [
              "flex",
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
        );
  },
});

export default TournamentBracket;
