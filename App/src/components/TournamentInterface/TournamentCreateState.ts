import { createElement, defineComponent, IComponent } from "@/uccello/Uccello";

interface TournamentCreateStateSt {
  number: number;
  nickName: string;
  title: string;
}
interface TournamentCreateStateProps {
  setState: (state: string) => void;
  setData: (
    state: string,
    number: number,
    nickName: string,
    title: string
  ) => void;
}

const TournamentCreateState = defineComponent<
  TournamentCreateStateSt,
  TournamentCreateStateProps
>({
  onMounted() {
    document.title = "Create Tournament";
  },
  state() {
    return { number: 4, nickName: "", title: "" };
  },
  render(
    this: IComponent<TournamentCreateStateSt, TournamentCreateStateProps>
  ) {
    return createElement("div", { class: ["h-full", "w-full"] }, [
      createElement(
        "div",
        { class: ["w-full", "h-full", "flex-row", "justify-center", "gap-16"] },
        [
          createElement("div", { class: ["gap-6"] }, [
            createElement("div", { class: ["items-start", "gap-4"] }, [
              createElement("label", { class: ["text-lg", "font-medium"] }, [
                "Nickname*",
              ]),
              createElement("input", {
                value: this.state.nickName,
                placeholder: "Enter Your Nickname",
                class: [
                  "px-4",
                  "py-4",
                  "w-full",
                  "h-[50px]",
                  "border-2",
                  "pr-[50px]",
                  "rounded-[14px]",
                  "text-[#878787]",
                  "bg-transparent",
                  "border-[#878787]",
                  "focus:outline-none",
                  "focus:border-[#828c3a]",
                  "transition-all",
                  "border-opacity-[50%]",
                ],
                on: {
                  input: (e) => {
                    this.updateState({ nickName: e.target.value });
                  },
                },
              }),
            ]),
            createElement("div", { class: ["items-start", "gap-4"] }, [
              createElement("label", { class: ["text-lg", "font-medium"] }, [
                "Name of Tournament*",
              ]),
              createElement("input", {
                placeholder: "Enter Name of Tournament",
                value: this.state.title,
                class: [
                  "px-4",
                  "py-4",
                  "w-full",
                  "h-[50px]",
                  "border-2",
                  "pr-[50px]",
                  "rounded-[14px]",
                  "text-[#878787]",
                  "bg-transparent",
                  "border-[#878787]",
                  "focus:outline-none",
                  "focus:border-[#828c3a]",
                  "transition-all",
                  "border-opacity-[50%]",
                ],
                on: {
                  input: (e) => {
                    this.updateState({ title: e.target.value });
                  },
                },
              }),
            ]),
            createElement(
              "div",
              { class: ["items-start", "gap-4", "w-full"] },
              [
                createElement("div", { class: ["text-lg", "font-medium"] }, [
                  "Number Of Players",
                ]),
                createElement("div", { class: ["flex-row", "gap-6"] }, [
                  createElement("div", { class: ["flex-row", "gap-4"] }, [
                    createElement("label", { class: ["text-xl"] }, ["4"]),
                    createElement("input", {
                      on: {
                        click: () => this.updateState({ number: 4 }),
                      },
                      checked: "true",
                      type: "radio",
                      name: "numberofplayers",
                      class: ["border-1"],
                    }),
                  ]),
                  createElement("div", { class: ["flex-row", "gap-4"] }, [
                    createElement("label", { class: ["text-xl"] }, ["8"]),
                    createElement("input", {
                      on: {
                        click: () => this.updateState({ number: 8 }),
                      },
                      type: "radio",
                      name: "numberofplayers",
                      class: ["border-1"],
                    }),
                  ]),
                  createElement("div", { class: ["flex-row", "gap-4"] }, [
                    createElement("label", { class: ["text-xl"] }, ["16"]),
                    createElement("input", {
                      on: {
                        click: () => this.updateState({ number: 16 }),
                      },
                      type: "radio",
                      name: "numberofplayers",
                      class: ["border-1"],
                    }),
                  ]),
                ]),
              ]
            ),
          ]),
          createElement(
            "div",
            { class: ["items-start", "justify-start", "text-left", "gap-4"] },
            [
              createElement("h4", { class: ["text-xl", "font-medium"] }, [
                "Tournament Rules",
              ]),
              createElement("div", { class: ["items-start", "gap-3"] }, [
                createElement("h5", { class: ["text-base"] }, [
                  "Player Signup",
                ]),
                createElement("ol", { class: ["list-disc", "ml-8"] }, [
                  createElement("li", { class: ["text-[12px]"] }, [
                    "Player must register with a valid username",
                  ]),
                  createElement("li", { class: ["text-[12px]"] }, [
                    "Registration closes 24 hours before the tournament start time.",
                  ]),
                ]),
              ]),
              createElement("div", { class: ["items-start", "gap-3"] }, [
                createElement("h5", { class: ["text-base"] }, [
                  "Tournament Structure",
                ]),
                createElement("ol", { class: ["list-disc", "ml-8"] }, [
                  createElement("li", { class: ["text-[12px]"] }, [
                    "Each match will consist of 3 rounds.",
                  ]),
                  createElement("li", { class: ["text-[12px]"] }, [
                    "The Winner of 2 out of 3 rounds advances to the next stage",
                  ]),
                ]),
              ]),
              createElement("div", { class: ["items-start", "gap-3"] }, [
                createElement("h5", { class: ["text-base"] }, [
                  "Game Settings",
                ]),
                createElement("ol", { class: ["list-disc", "ml-8"] }, [
                  createElement("li", { class: ["text-[12px]"] }, [
                    "The default game settings will be applied.",
                  ]),
                  createElement(
                    "li",
                    { class: ["text-[12px]", "max-w-[340px]"] },
                    [
                      "Any changes to the game settings must be approved by the tournament organizers.",
                    ]
                  ),
                ]),
              ]),
            ]
          ),
        ]
      ),
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
              on: {
                click: () => this.props.setState("start"),
              },
            },
            ["Cancel"]
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
                click: () => {
                  this.props.setData(
                    "bracket",
                    this.state.number,
                    this.state.nickName,
                    this.state.title
                  );
                },
              },
            },
            ["Create"]
          ),
        ]
      ),
    ]);
  },
});

export default TournamentCreateState;
