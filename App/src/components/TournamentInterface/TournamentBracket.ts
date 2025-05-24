import { createElement, defineComponent, IComponent } from "@/uccello/Uccello";
import TournamentInvite from "./TournamentInvite";
import enhancedFetch from "@/Hooks/fetch";
import { router } from "@/router/Router";

interface TournamentBracketProps {
  number: number;
}

interface TournamentBracketState {
  inviteUsers: boolean;
  isLoading: boolean;
  numberOfPlayers: number;
}

const TournamentBracket = defineComponent<
  TournamentBracketState,
  TournamentBracketProps
>({
  async onMounted(
    this: IComponent<TournamentBracketState, TournamentBracketProps>
  ) {
    try {
      const response = await enhancedFetch.fetch(
        `https://www.meedivo.me/api/tournament/${(router.getParams as any).id}`
      );
      const data = await response.json();
      this.updateState({ numberOfPlayers: data.total_places });
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  },
  state() {
    return { inviteUsers: false, isLoading: true, numberOfPlayers: 4 };
  },
  render(this: IComponent<TournamentBracketState, TournamentBracketProps>) {
    return createElement(
      "div",
      { class: ["w-full", "h-full", "flex-row", "relative"] },
      [
        createElement(
          "div",
          {
            class: ["h-full", "w-full", "flex-row", "justify-center", "gap-5"],
          },
          [
            createElement(
              "div",
              {
                class: [
                  "h-full",
                  "gap-5",
                  "justify-around",
                  this.props.number != 16 ? "blur-sm" : "blur-0",
                  this.props.number != 16
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
                        // createElement("i", {
                        //   on: {
                        //     click: () =>
                        //       this.updateState({
                        //         inviteUsers: !this.state.inviteUsers,
                        //       }),
                        //   },
                        //   class: [
                        //     "ph",
                        //     "ph-user-plus",
                        //     "text-[26px]",
                        //     "text-[var(--light-grey)]",
                        //   ],
                        // }),
                        createElement(
                          "div",
                          {
                            class: [
                              "w-full",
                              "h-full",
                              "flex-row",
                              "justify-start",
                              "px-4",
                              "gap-2",
                            ],
                          },
                          [
                            createElement("img", {
                              src: "/assets/default.webp",
                              width: "25",
                              height: "25",
                              class: ["rounded-full"],
                            }),
                            "meedivo",
                          ]
                        ),
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
                        createElement("i", {
                          on: {
                            click: () =>
                              this.updateState({
                                inviteUsers: !this.state.inviteUsers,
                              }),
                          },
                          class: [
                            "ph",
                            "ph-user-plus",
                            "text-[26px]",
                            "text-[var(--light-grey)]",
                            "hover:text-[var(--light-yellow)]",
                          ],
                        }),
                        // createElement(
                        //   "div",
                        //   {
                        //     class: [
                        //       "w-full",
                        //       "h-full",
                        //       "flex-row",
                        //       "justify-start",
                        //       "px-4",
                        //       "gap-2",
                        //     ],
                        //   },
                        //   [
                        //     createElement("img", {
                        //       src: "/assets/default.webp",
                        //       width: "25",
                        //       height: "25",
                        //       class: ["rounded-full"],
                        //     }),
                        //     "meedivo",
                        //   ]
                        // ),
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
                  this.props.number == 4 ? "blur-sm" : "blur-0",
                  this.props.number == 4
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
                        // createElement("i", {
                        //   on: {
                        //     click: () =>
                        //       this.updateState({
                        //         inviteUsers: !this.state.inviteUsers,
                        //       }),
                        //   },
                        //   class: [
                        //     "ph",
                        //     "ph-user-plus",
                        //     "text-[26px]",
                        //     "text-[var(--light-grey)]",
                        //   ],
                        // }),
                        createElement(
                          "div",
                          {
                            class: [
                              "w-full",
                              "h-full",
                              "flex-row",
                              "justify-start",
                              "px-4",
                              "gap-2",
                            ],
                          },
                          [
                            createElement("img", {
                              src: "/assets/default.webp",
                              width: "25",
                              height: "25",
                              class: ["rounded-full"],
                            }),
                            "meedivo",
                          ]
                        ),
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
                        createElement("i", {
                          on: {
                            click: () =>
                              this.updateState({
                                inviteUsers: !this.state.inviteUsers,
                              }),
                          },
                          class: [
                            "ph",
                            "ph-user-plus",
                            "text-[26px]",
                            "text-[var(--light-grey)]",
                          ],
                        }),
                        // createElement(
                        //   "div",
                        //   {
                        //     class: [
                        //       "w-full",
                        //       "h-full",
                        //       "flex-row",
                        //       "justify-start",
                        //       "px-4",
                        //       "gap-2",
                        //     ],
                        //   },
                        //   [
                        //     createElement("img", {
                        //       src: "/assets/default.webp",
                        //       width: "25",
                        //       height: "25",
                        //       class: ["rounded-full"],
                        //     }),
                        //     "meedivo",
                        //   ]
                        // ),
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
                        // createElement("i", {
                        //   on: {
                        //     click: () =>
                        //       this.updateState({
                        //         inviteUsers: !this.state.inviteUsers,
                        //       }),
                        //   },
                        //   class: [
                        //     "ph",
                        //     "ph-user-plus",
                        //     "text-[26px]",
                        //     "text-[var(--light-grey)]",
                        //   ],
                        // }),
                        createElement(
                          "div",
                          {
                            class: [
                              "w-full",
                              "h-full",
                              "flex-row",
                              "justify-start",
                              "px-4",
                              "gap-2",
                            ],
                          },
                          [
                            createElement("img", {
                              src: "/assets/default.webp",
                              width: "25",
                              height: "25",
                              class: ["rounded-full"],
                            }),
                            "meedivo",
                          ]
                        ),
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
                        createElement("i", {
                          on: {
                            click: () =>
                              this.updateState({
                                inviteUsers: !this.state.inviteUsers,
                              }),
                          },
                          class: [
                            "ph",
                            "ph-user-plus",
                            "text-[26px]",
                            "text-[var(--light-grey)]",
                          ],
                        }),
                        // createElement(
                        //   "div",
                        //   {
                        //     class: [
                        //       "w-full",
                        //       "h-full",
                        //       "flex-row",
                        //       "justify-start",
                        //       "px-4",
                        //       "gap-2",
                        //     ],
                        //   },
                        //   [
                        //     createElement("img", {
                        //       src: "/assets/default.webp",
                        //       width: "25",
                        //       height: "25",
                        //       class: ["rounded-full"],
                        //     }),
                        //     "meedivo",
                        //   ]
                        // ),
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
                  createElement("i", {
                    on: {
                      click: () =>
                        this.updateState({
                          inviteUsers: !this.state.inviteUsers,
                        }),
                    },
                    class: [
                      "ph",
                      "ph-user-plus",
                      "text-[26px]",
                      "text-[var(--light-grey)]",
                    ],
                  }),
                  // createElement(
                  //   "div",
                  //   {
                  //     class: [
                  //       "w-full",
                  //       "h-full",
                  //       "flex-row",
                  //       "justify-start",
                  //       "px-4",
                  //       "gap-2",
                  //     ],
                  //   },
                  //   [
                  //     createElement("img", {
                  //       src: "/assets/default.webp",
                  //       width: "25",
                  //       height: "25",
                  //       class: ["rounded-full"],
                  //     }),
                  //     "meedivo",
                  //   ]
                  // ),
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
                  this.props.number != 16 ? "blur-sm" : "blur-0",
                  this.props.number != 16
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
                        // createElement("i", {
                        //   on: {
                        //     click: () =>
                        //       this.updateState({
                        //         inviteUsers: !this.state.inviteUsers,
                        //       }),
                        //   },
                        //   class: [
                        //     "ph",
                        //     "ph-user-plus",
                        //     "text-[26px]",
                        //     "text-[var(--light-grey)]",
                        //   ],
                        // }),
                        createElement(
                          "div",
                          {
                            class: [
                              "w-full",
                              "h-full",
                              "flex-row",
                              "justify-start",
                              "px-4",
                              "gap-2",

                              "scale-x-[-1]",
                            ],
                          },
                          [
                            createElement("img", {
                              src: "/assets/default.webp",
                              width: "25",
                              height: "25",
                              class: ["rounded-full"],
                            }),

                            "meedivo",
                          ]
                        ),
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
                        createElement("i", {
                          on: {
                            click: () =>
                              this.updateState({
                                inviteUsers: !this.state.inviteUsers,
                              }),
                          },
                          class: [
                            "ph",
                            "ph-user-plus",
                            "text-[26px]",
                            "text-[var(--light-grey)]",
                            "hover:text-[var(--light-yellow)]",
                          ],
                        }),
                        // createElement(
                        //   "div",
                        //   {
                        //     class: [
                        //       "w-full",
                        //       "h-full",
                        //       "flex-row",
                        //       "justify-start",
                        //       "px-4",
                        //       "gap-2",
                        //"scale-x-[-1]",
                        //     ],
                        //   },
                        //   [
                        //     createElement("img", {
                        //       src: "/assets/default.webp",
                        //       width: "25",
                        //       height: "25",
                        //       class: ["rounded-full"],
                        //     }),
                        //     "meedivo",
                        //   ]
                        // ),
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
                  this.props.number == 4 ? "blur-sm" : "blur-0",
                  this.props.number == 4
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
                        // createElement("i", {
                        //   on: {
                        //     click: () =>
                        //       this.updateState({
                        //         inviteUsers: !this.state.inviteUsers,
                        //       }),
                        //   },
                        //   class: [
                        //     "ph",
                        //     "ph-user-plus",
                        //     "text-[26px]",
                        //     "text-[var(--light-grey)]",
                        //   ],
                        // }),
                        createElement(
                          "div",
                          {
                            class: [
                              "w-full",
                              "h-full",
                              "flex-row",
                              "justify-start",
                              "px-4",
                              "gap-2",
                              "scale-x-[-1]",
                            ],
                          },
                          [
                            createElement("img", {
                              src: "/assets/default.webp",
                              width: "25",
                              height: "25",
                              class: ["rounded-full"],
                            }),
                            "meedivo",
                          ]
                        ),
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
                        createElement("i", {
                          on: {
                            click: () =>
                              this.updateState({
                                inviteUsers: !this.state.inviteUsers,
                              }),
                          },
                          class: [
                            "ph",
                            "ph-user-plus",
                            "text-[26px]",
                            "text-[var(--light-grey)]",
                          ],
                        }),
                        // createElement(
                        //   "div",
                        //   {
                        //     class: [
                        //       "w-full",
                        //       "h-full",
                        //       "flex-row",
                        //       "justify-start",
                        //       "px-4",
                        //       "gap-2",
                        //"scale-x-[-1]",
                        //     ],
                        //   },
                        //   [
                        //     createElement("img", {
                        //       src: "/assets/default.webp",
                        //       width: "25",
                        //       height: "25",
                        //       class: ["rounded-full"],
                        //     }),
                        //     "meedivo",
                        //   ]
                        // ),
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
                        // createElement("i", {
                        //   on: {
                        //     click: () =>
                        //       this.updateState({
                        //         inviteUsers: !this.state.inviteUsers,
                        //       }),
                        //   },
                        //   class: [
                        //     "ph",
                        //     "ph-user-plus",
                        //     "text-[26px]",
                        //     "text-[var(--light-grey)]",
                        //   ],
                        // }),
                        createElement(
                          "div",
                          {
                            class: [
                              "w-full",
                              "h-full",
                              "flex-row",
                              "justify-start",
                              "px-4",
                              "gap-2",
                              "scale-x-[-1]",
                            ],
                          },
                          [
                            createElement("img", {
                              src: "/assets/default.webp",
                              width: "25",
                              height: "25",
                              class: ["rounded-full"],
                            }),
                            "meedivo",
                          ]
                        ),
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
                        createElement("i", {
                          on: {
                            click: () =>
                              this.updateState({
                                inviteUsers: !this.state.inviteUsers,
                              }),
                          },
                          class: [
                            "ph",
                            "ph-user-plus",
                            "text-[26px]",
                            "text-[var(--light-grey)]",
                          ],
                        }),
                        // createElement(
                        //   "div",
                        //   {
                        //     class: [
                        //       "w-full",
                        //       "h-full",
                        //       "flex-row",
                        //       "justify-start",
                        //       "px-4",
                        //       "gap-2",
                        //"scale-x-[-1]",
                        //     ],
                        //   },
                        //   [
                        //     createElement("img", {
                        //       src: "/assets/default.webp",
                        //       width: "25",
                        //       height: "25",
                        //       class: ["rounded-full"],
                        //     }),
                        //     "meedivo",
                        //   ]
                        // ),
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
                  createElement("i", {
                    on: {
                      click: () =>
                        this.updateState({
                          inviteUsers: !this.state.inviteUsers,
                        }),
                    },
                    class: [
                      "ph",
                      "ph-user-plus",
                      "text-[26px]",
                      "text-[var(--light-grey)]",
                    ],
                  }),
                  // createElement(
                  //   "div",
                  //   {
                  //     class: [
                  //       "w-full",
                  //       "h-full",
                  //       "flex-row",
                  //       "justify-start",
                  //       "px-4",
                  //       "gap-2",
                  //"scale-x-[-1]",
                  //     ],
                  //   },
                  //   [
                  //     createElement("img", {
                  //       src: "/assets/default.webp",
                  //       width: "25",
                  //       height: "25",
                  //       class: ["rounded-full"],
                  //     }),
                  //     "meedivo",
                  //   ]
                  // ),
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
    );
  },
});

export default TournamentBracket;
