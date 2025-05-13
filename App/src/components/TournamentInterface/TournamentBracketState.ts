import { createElement, defineComponent, IComponent } from "@/uccello/Uccello";

const BracketCard = (text: string, withLine: boolean, lineLeft = false) => {
  const base = [
    "border",
    "border-[#878787]",
    "border-opacity-30",
    "rounded-2xl",
    "px-4",
    "py-2",
    "w-[150px]",
    "text-center",
    "relative",
  ];

  const beforeLine = lineLeft
    ? [
        "before:absolute",
        "before:content-['']",
        "before:block",
        "before:w-[30px]",
        "before:left-full",
        "before:top-1/2",
        "before:h-px",
        "before:bg-[#878787]",  
        "before:opacity-30",
      ]
    : [];

  const afterLine = withLine
    ? [
        "after:absolute",
        "after:content-['']",
        "after:block",
        "after:w-[30px]",
        "after:right-full",
        "after:top-1/2",
        "after:h-px",
        "after:bg-[#878787]",
        "after:opacity-30",
      ]
    : [];

  return createElement(
    "div",
    {
      class: [...base, ...beforeLine, ...afterLine],
    },
    [text]
  );
};

const SideColumn = (players: string[], isLeft: boolean) => {
  return createElement(
    "div",
    { class: ["flex", "flex-col", "justify-between", "h-full", "gap-6"] },
    players.map((p, i) => BracketCard(p, true, isLeft))
  );
};

const SemisColumn = (players: string[], isLeft: boolean) => {
  return createElement(
    "div",
    {
      class: [
        "flex",
        "flex-col",
        "justify-around",
        "h-full",
        "gap-[100px]",
        "items-center",
      ],
    },
    // Fix to display matchups: "W1 vs W2", "W3 vs W4", etc.
    players.map((p, i, arr) =>
      i % 2 === 0
        ? BracketCard(`${arr[i]} vs ${arr[i + 1]}`, true, isLeft)
        : null
    )
  );
};

const WinnerCard = () => {
  return createElement(
    "div",
    {
      class: ["flex", "items-center", "justify-center", "h-full"],
    },
    [
      createElement(
        "div",
        {
          class: [
            "border",
            "border-[#878787]",
            "border-opacity-30",
            "rounded-2xl",
            "px-6",
            "py-3",
            "w-[150px]",
            "text-center",
            "bg-yellow-100",
            "font-bold",
          ],
        },
        ["🏆 Winner"]
      ),
    ]
  );
};

const TournamentSixteenFull = defineComponent<void>({
  render(this: IComponent<void>) {
    return createElement(
      "div",
      {
        class: [
          "flex",
          "flex-row",
          "justify-between",
          "items-center",
          "h-screen",
          "px-10",
          "gap-6",
        ],
      },
      [
        SideColumn(["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"], true),

        // Semis Column (4 players for semifinals)
        SemisColumn(["W1", "W2", "W3", "W4"], true),

        WinnerCard(),

        // Semis Column (4 players for semifinals)
        SemisColumn(["W5", "W6", "W7", "W8"], false),

        SideColumn(
          ["P9", "P10", "P11", "P12", "P13", "P14", "P15", "P16"],
          false
        ),
      ]
    );
  },
});

const TournamentBracketState = defineComponent<void>({
  render(this: IComponent<void>) {
    return createElement("div", { class: ["w-full", "h-full"] }, [
      createElement(TournamentSixteenFull),
    ]);
  },
});

export default TournamentBracketState;
