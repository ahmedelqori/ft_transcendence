import {
  createElement,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";

interface PlayerInfoProps {
  players: any;
  playerPosition: string;
  side: "left" | "right";
}

interface PlayerInfoState {}

const PlayerInfo = defineComponent<PlayerInfoState, PlayerInfoProps>({
  state(): PlayerInfoState {
    return {};
  },

  render(this: IComponent<PlayerInfoState, PlayerInfoProps>) {
    const { players, side } = this.props;
    if (!players) return createElement("div");
    const player = Object.values(players).find((p: any) => p?.position === side) as any;
    if (!player || !player.player) return createElement("div");
    const username = player.player?.username;
    const avatarUrl = player.player?.avatar_url || "/assets/default.webp";

    return createElement(
      "div",
      {
        class: [
          "flex",
          "items-center",
          "absolute",
          side === "left" ? "left-4" : "right-4",
          "top-4",
          "z-50",
          "gap-3",
          side === "left" ? "flex-row" : "flex-row-reverse",
        ],
      },
      [
        createElement(
          "div",
          {
            class: [
              "w-[60px]",
              "h-[60px]",
              "max-md:w-[46px]",
              "max-md:h-[46px]",
              "rounded-full",
              "flex",
              "items-center",
              "justify-center",
            ],
          },
          [
            createElement("img", {
              loading: "lazy",
              class: ["w-full", "h-full", "rounded-full", "object-cover"],
              src: avatarUrl,
              alt: username,
            }),
          ]
        ),
        createElement(
          "span",
          {
            class: [
              "text-sm",
              "font-medium",
              "whitespace-nowrap",
              "text-white",
            ],
          },
          [username]
        ),
      ]
    );
  },
});

export { PlayerInfo };