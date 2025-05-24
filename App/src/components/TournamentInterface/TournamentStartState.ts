import { authState } from "@/Hooks/Auth";
import enhancedFetch from "@/Hooks/fetch";
import { router } from "@/router/Router";
import {
  createElement,
  createFragment,
  defineComponent,
  eventBus,
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
  id: number;
}

interface TournamentStartStateSt {
  tournaments: roomInterface[];
  id: number;
  nickName: string;
  selected: boolean;
}
interface TournamentStartProps {
  setState: (state: string) => void;
}

const TournamentStartState = defineComponent<
  TournamentStartStateSt,
  TournamentStartProps
>({
  async onMounted(
    this: IComponent<TournamentStartStateSt> & {
      convertTime: (input: string) => string;
    }
  ) {
    try {
      const res = await enhancedFetch.fetch(
        "https://www.meedivo.me/api/tournament/list"
      );
      const data = await res.json();
      if (this.getIsMounted)
        this.updateState({
          tournaments: data.map((e: any) => {
            return {
              name: e.name,
              owner: e.owner.username,
              createdAt: this.convertTime(e.created_at),
              maxplayers: e.total_places,
              currentplayers: e.total_players,
              id: e.id,
              nickname: e.nickname,
            };
          }),
        });
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  },
  state() {
    return {
      tournaments: [],
      id: -1,
      selected: false,
      nickName: "",
    };
  },
  render(
    this: IComponent<TournamentStartStateSt, TournamentStartProps> & {
      handleSelectTournament: () => Promise<void>;
      resetOptions: () => void;
    }
  ) {
    return createElement("div", { class: ["h-full", "w-full", "relative"] }, [
      createElement(
        "div",
        {
          class: ["h-fit", "w-full", "relative", "overflow-hidden"],
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
                    {
                      class: [
                        this.state.selected ? "blur-sm" : "blur-none",
                        this.state.selected
                          ? "pointer-events-none"
                          : "pointer-events-auto",
                      ],
                    },
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
                              on: {
                                click: async () => {
                                  if (
                                    el.owner ==
                                    authState.getState().user?.username
                                  )
                                    router.navigateTo(`/tournament/${el.id}`);
                                  else {
                                    this.updateState({
                                      id: el.id,
                                      selected: true,
                                    });
                                  }
                                },
                              },
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
      this.state.selected
        ? createElement(TournamentSelected, {
            class: ["w-full", "h-full"],
            GoToTournament: () => this.handleSelectTournament(),
            setNickName: (nickName: string) => this.updateState({ nickName }),
            resetOptions: () => this.resetOptions(),
          })
        : null,
    ]);
  },
  async handleSelectTournament(
    this: IComponent<TournamentStartStateSt, TournamentStartProps>
  ) {
    try {
      const response = await enhancedFetch.fetch(
        `https://www.meedivo.me/api/tournament/${this.state.id}/join?code=6785`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nickname: this.state.nickName }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData);
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }
      console.log(this.state.id, this.state.nickName);
      router.navigateTo(`/tournament/${this.state.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  resetOptions(this: IComponent<TournamentStartStateSt, TournamentStartProps>) {
    this.updateState({ id: -1, selected: false, nickName: "" });
  },
  convertTime(input: string) {
    const parts = input.split(" ")[0].split("-");
    const formatted = `${parts[2]}/${parts[1]}/${parts[0].slice(2)}`;
    return formatted;
  },
});

interface TournamentSelectedProps {
  GoToTournament: () => void;
  setNickName: (nickName: string) => void;
  resetOptions: () => void;
}

const TournamentSelected = defineComponent<void, TournamentSelectedProps>({
  onMounted(
    this: IComponent<void, TournamentSelectedProps> & {
      handleClickOutSide: (e: MouseEvent) => void;
    }
  ) {
    this.handleClickOutSide = this.handleClickOutSide.bind(this);
    document.addEventListener("mousedown", this.handleClickOutSide);
  },
  render(this: IComponent<void, TournamentSelectedProps>) {
    return createElement(
      "div",
      {
        class: [
          "absolute",
          "top-1/2",
          "left-1/2",
          "blur-none",
          "w-fit",
          "h-[46px]",
          "bg-[var(--light-yellow)]",
          "rounded-[33px]",
          "flex-row",
          "items-center",
        ],
        style: {
          transform: "translate(-50%, -50%)",
        },
      },
      [
        createElement("input", {
          on: {
            input: (e: any) => {
              this.props.setNickName(e.target.value);
            },
          },
          placeholder: "Enter Your NickName",
          class: [
            "border-2",
            "bg-[var(--dark-black)]",
            "w-full",
            "max-w-full",
            "md:max-w-[80%]",
            "rounded-3xl",
            "outline-none",
            "border-[var(--dark-black)]",
            "border-opacity-[30%]",
            "px-3",
            "md:px-4",
            "py-2",
            "md:py-3",
            // "focus:border-[#828c3a]",
            "text-[#878787]",
            "focus:outline-none",
            "text-sm",
            "md:text-base",
          ],
        }),
        createElement(
          "button",
          {
            on: {
              click: () => this.props.GoToTournament(),
            },
            class: [
              "mx-auto",
              "text-[var(--dark-black)]",
              "font-medium",
              "flex-row",
              "items-center",
              "gap-px",
              "flex",
            ],
          },
          [
            "Go",
            createElement("i", {
              class: ["ph", "ph-arrow-up-right", "font-semibold"],
            }),
          ]
        ),
      ]
    );
  },
  handleClickOutSide(
    this: IComponent<void, TournamentSelectedProps>,
    e: MouseEvent
  ) {
    const element = this.getHtmlElement;
    if (element && !element.contains(e.target as Node)) {
      this.props.resetOptions();
    }
  },
});

export default TournamentStartState;
