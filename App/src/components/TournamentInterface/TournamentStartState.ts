import {
  createElement,
  createFragment,
  defineComponent,
  IComponent,
} from "@/uccello/Uccello";

interface roomInterface {
  name: string;
  nickname: string;
  owner: string;
  createdAt: string;
  endAt: string;
  currentplayers: number;
  maxplayers: number;
}

interface TournamentStartState {
  tournaments: roomInterface[];
}
interface TournamentStartProps {
  setState: (state: string) => void;
}
const TournamentStartState = defineComponent<
  TournamentStartState,
  TournamentStartProps
>({
  state() {
    return {
      tournaments: [
        {
          name: "Cup-1337",
          nickname: "Meedivo",
          owner: "ael-qori",
          createdAt: "02/05/25",
          endAt: "03/05/25",
          currentplayers: 4,
          maxplayers: 16,
        },
        {
          name: "La Liga",
          nickname: "Ronaldo",
          owner: "afanidi",
          createdAt: "05/05/25",
          endAt: "06/05/25",
          currentplayers: 2,
          maxplayers: 8,
        },
        {
          name: "Cup-1337",
          nickname: "Meedivo",
          owner: "ael-qori",
          createdAt: "02/05/25",
          endAt: "03/05/25",
          currentplayers: 4,
          maxplayers: 16,
        },
        {
          name: "La Liga",
          nickname: "Ronaldo",
          owner: "afanidi",
          createdAt: "05/05/25",
          endAt: "06/05/25",
          currentplayers: 2,
          maxplayers: 8,
        },
        {
          name: "Cup-1337",
          nickname: "Meedivo",
          owner: "ael-qori",
          createdAt: "02/05/25",
          endAt: "03/05/25",
          currentplayers: 4,
          maxplayers: 16,
        },
        {
          name: "La Liga",
          nickname: "Ronaldo",
          owner: "afanidi",
          createdAt: "05/05/25",
          endAt: "06/05/25",
          currentplayers: 2,
          maxplayers: 8,
        },
        {
          name: "Cup-1337",
          nickname: "Meedivo",
          owner: "ael-qori",
          createdAt: "02/05/25",
          endAt: "03/05/25",
          currentplayers: 4,
          maxplayers: 16,
        },
        {
          name: "La Liga",
          nickname: "Ronaldo",
          owner: "afanidi",
          createdAt: "05/05/25",
          endAt: "06/05/25",
          currentplayers: 2,
          maxplayers: 8,
        },
        {
          name: "Cup-1337",
          nickname: "Meedivo",
          owner: "ael-qori",
          createdAt: "02/05/25",
          endAt: "03/05/25",
          currentplayers: 4,
          maxplayers: 16,
        },
        {
          name: "La Liga",
          nickname: "Ronaldo",
          owner: "afanidi",
          createdAt: "05/05/25",
          endAt: "06/05/25",
          currentplayers: 2,
          maxplayers: 8,
        },
        {
          name: "Cup-1337",
          nickname: "Meedivo",
          owner: "ael-qori",
          createdAt: "02/05/25",
          endAt: "03/05/25",
          currentplayers: 4,
          maxplayers: 16,
        },
        {
          name: "La Liga",
          nickname: "Ronaldo",
          owner: "afanidi",
          createdAt: "05/05/25",
          endAt: "06/05/25",
          currentplayers: 2,
          maxplayers: 8,
        },
        {
          name: "Cup-1337",
          nickname: "Meedivo",
          owner: "ael-qori",
          createdAt: "02/05/25",
          endAt: "03/05/25",
          currentplayers: 4,
          maxplayers: 16,
        },
        {
          name: "La Liga",
          nickname: "Ronaldo",
          owner: "afanidi",
          createdAt: "05/05/25",
          endAt: "06/05/25",
          currentplayers: 2,
          maxplayers: 8,
        },
        {
          name: "Cup-1337",
          nickname: "Meedivo",
          owner: "ael-qori",
          createdAt: "02/05/25",
          endAt: "03/05/25",
          currentplayers: 4,
          maxplayers: 16,
        },
        {
          name: "La Liga",
          nickname: "Ronaldo",
          owner: "afanidi",
          createdAt: "05/05/25",
          endAt: "06/05/25",
          currentplayers: 2,
          maxplayers: 8,
        },
        {
          name: "Cup-1337",
          nickname: "Meedivo",
          owner: "ael-qori",
          createdAt: "02/05/25",
          endAt: "03/05/25",
          currentplayers: 4,
          maxplayers: 16,
        },
        {
          name: "La Liga",
          nickname: "Ronaldo",
          owner: "afanidi",
          createdAt: "05/05/25",
          endAt: "06/05/25",
          currentplayers: 2,
          maxplayers: 8,
        },
        {
          name: "Cup-1337",
          nickname: "Meedivo",
          owner: "ael-qori",
          createdAt: "02/05/25",
          endAt: "03/05/25",
          currentplayers: 4,
          maxplayers: 16,
        },
        {
          name: "La Liga",
          nickname: "Ronaldo",
          owner: "afanidi",
          createdAt: "05/05/25",
          endAt: "06/05/25",
          currentplayers: 2,
          maxplayers: 8,
        },
      ],
    };
  },
  render(this: IComponent<TournamentStartState, TournamentStartProps>) {
    return createElement("div", { class: ["h-full", "w-full"] }, [
      createElement(
        "div",
        {
          class: ["h-full", "w-full", "relative", "overflow-hidden"],
        },
        [
          createElement(
            "div",
            {
              class: [
                "max-h-[calc(100vh-200px)]",
                "overflow-y-auto",
                "w-full",
                "scroll-smooth",
                "overflow-scroll",
                "overflow-x-hidden",
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
            [
              createElement(
                "table",
                {
                  class: ["w-full", "border-separate"],
                },
                [
                  createElement(
                    "thead",
                    {
                      class: ["sticky", "top-0"],
                    },
                    [
                      createElement("tr", { class: ["text-center"] }, [
                        createElement("th", { class: ["font-normal", "p-2"] }, [
                          "Name",
                        ]),
                        createElement("th", { class: ["font-normal", "p-2"] }, [
                          "NickName",
                        ]),
                        createElement("th", { class: ["font-normal", "p-2"] }, [
                          "Owner",
                        ]),
                        createElement("th", { class: ["font-normal", "p-2"] }, [
                          "Created At",
                        ]),
                        createElement("th", { class: ["font-normal", "p-2"] }, [
                          "DeadLine",
                        ]),
                        createElement("th", { class: ["font-normal", "p-2"] }, [
                          "Number Of Players",
                        ]),
                      ]),
                    ]
                  ),

                  createElement(
                    "tbody",
                    {},
                    this.state.tournaments.length
                      ? this.state.tournaments.map((el) =>
                          createElement(
                            "tr",
                            {
                              class: [
                                "text-center",
                                "text-[var(--light-grey)]",
                                "cursor-pointer",
                                "hover:text-[var(--light-yellow)]",
                                "hover:opacity-0.5",
                              ],
                            },
                            [
                              createElement(
                                "td",
                                { class: ["font-normal", "p-2"] },
                                [el.name]
                              ),
                              createElement(
                                "td",
                                { class: ["font-normal", "p-2"] },
                                [el.nickname]
                              ),
                              createElement(
                                "td",
                                { class: ["font-normal", "p-2"] },
                                [el.owner]
                              ),
                              createElement(
                                "td",
                                { class: ["font-normal", "p-2"] },
                                [el.createdAt]
                              ),
                              createElement(
                                "td",
                                { class: ["font-normal", "p-2"] },
                                [el.endAt]
                              ),
                              createElement(
                                "td",
                                { class: ["font-normal", "p-2"] },
                                [`${el.currentplayers} / ${el.maxplayers}`]
                              ),
                            ]
                          )
                        )
                      : []
                  ),
                ]
              ),
            ]
          ),
        ]
      ),
      this.state.tournaments.length
        ? null
        : createElement("div", { class: ["gap-6", "my-auto"] }, [
            createElement("h3", { class: ["text-4xl"] }, [
              "List of Tournaments...",
            ]),

            createElement(
              "p",
              {
                class: [
                  "text-base",
                  "max-w-[50%]",
                  "text-center",
                  "text-[var(--light-grey)]",
                ],
              },
              [
                "There are no tournaments at the moment. To start competing, you need to create a tournament. Gather players, set the rules and begin the challenge!",
              ]
            ),
          ]),
      createElement(
        "div",
        { class: ["flex-row", "gap-8", "mb-8", "w-[35%]", "justify-center"] },
        [
          createElement(
            "button",
            {
              class: [
                "flex-1",
                "rounded-2xl",
                "bg-[var(--main-color)]",
                "text-[var(--dark-black)]",
                "font-medium",
                "px-10",
                "py-2",
                "gap-2",
                "text-lg",
                "text-center",
              ],
            },
            ["Join Tournament"]
          ),
          createElement(
            "button",
            {
              class: [
                "flex-1",
                "rounded-2xl",
                "bg-[var(--light-yellow)]",
                "text-[var(--dark-black)]",
                "font-medium",
                "px-10",
                "py-2",
                "gap-2",
                "text-lg",
                "text-center",
              ],
              on: {
                click: () => this.props.setState("create"),
              },
            },
            ["Create Tournament"]
          ),
        ]
      ),
    ]);
  },
});

export default TournamentStartState;
