import {
  createElement,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";
import { type GameState, GameStates } from "@/services/socket-manager.js";

interface GameControlsProps {
  isConnected: boolean;
  gameState: GameState;
  onPause: () => void;
  onCancel: () => void;
}

export const GameControls = defineComponent<void, GameControlsProps>({
  state() {},
  render(this: IComponent<any, GameControlsProps>) {
    const { isConnected, gameState, onPause, onCancel } = this.props;
    const canPauseOrResume = gameState && (gameState.state === GameStates.IN_PLAY || gameState.state === GameStates.PAUSED);
    const isPaused = gameState && gameState.state === GameStates.PAUSED;
    const pauseButtonText = isPaused ? "Resume" : "Pause";
    const pauseIcon = isPaused ? "ph-play" : "ph-pause";
    const pauseButtonBaseClasse = [
      "flex",
      "items-center",
      "justify-center",
      "px-4",
      "py-2",
      "text-[var(--light-grey)]",
      "rounded-md",
      "transition",
      "duration-200",
      "text-[14px]",
      "max-xl:text-[12px]",
      "bg-[var(--dark-grey)]",
    ];
    const cancelButtonBaseClass = [
      "flex",
      "items-center",
      "justify-center",
      "px-4",
      "py-2",
      "text-white",
      "rounded-md",
      "transition",
      "duration-200",
      "text-[14px]",
      "max-xl:text-[12px]",
      "focus:outline-none",
      "focus:ring-0",
      "bg-[#ff4d4d]",
    ];
    const cancelButtonClasses = !isConnected ? [...cancelButtonBaseClass, "opacity-50", "cursor-not-allowed"] : [...cancelButtonBaseClass, "hover:bg-[#e63939]"];
    let pauseButtonClasses = isPaused ? [
          ...pauseButtonBaseClasse,
          "ring-2",
          "ring-[var(--light-yellow)]",
          "outline-none",
          "hover:bg-[var(--darker-grey)]",
        ]
      : [
          ...pauseButtonBaseClasse,
          "focus:outline-none",
          "focus:ring-0",
          "hover:bg-[var(--darker-grey)]",
        ];
    pauseButtonClasses = !canPauseOrResume ? [...pauseButtonClasses, "opacity-50", "cursor-not-allowed"] : pauseButtonClasses;
    return createElement(
      "div",
      { class: ["flex", "flex-row", "justify-center", "gap-8", "mb-3"] },
      [
        createElement(
          "button",
          {
            class: pauseButtonClasses,
            on: {
              click: () => onPause(),
            },
            disabled: !canPauseOrResume,
          },
          [
            createElement("i", {
              class: ["ph", pauseIcon, "mr-2"],
            }),
            pauseButtonText,
          ]
        ),
        createElement(
          "button",
          {
            class: cancelButtonClasses,
            on: {
              click: (e) => {
                (e.target as HTMLElement).blur();
                onCancel();
              },
            },
            disabled: !isConnected,
          },
          [
            createElement("i", {
              class: ["ph", "ph-x-circle", "mr-2"],
            }),
            "Cancel",
          ]
        ),
      ]
    );
  },
});

export default GameControls;
