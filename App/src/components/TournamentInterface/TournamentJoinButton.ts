import { createElement, defineComponent, IComponent } from "@/uccello/Uccello";

interface TournamentJoinButtonProps {
  id: string;
  code: string;
  nickname: string;
  setJoinId: (id: string) => void;
  setJoinNickName: (nickname: string) => void;
  setJoinCode: (code: string) => void;
  resetOptions: () => void;
  joinTournament: () => void;
}

interface TournamentJoinButtonState {}

const TournamentJoinButton = defineComponent<
  TournamentJoinButtonState,
  TournamentJoinButtonProps
>({
  onMounted(
    this: IComponent<void, TournamentJoinButtonProps> & {
      handleClickOutSide: (e: MouseEvent) => void;
    }
  ) {
    this.handleClickOutSide = this.handleClickOutSide.bind(this);
    document.addEventListener("mousedown", this.handleClickOutSide);
  },
  render(this: IComponent<void, TournamentJoinButtonProps>) {
    return createElement(
      "div",
      {
        class: [
          "absolute",
          "top-1/2",
          "left-1/2",
          "blur-none",
          "w-[360px]",
          "rounded-[33px]",
          "flex-col",
          "items-center",
          "justify-between",
          "gap-2",
          "bg-white",
          "px-4",
          "py-8",
        ],
        style: {
          transform: "translate(-50%, -50%)",
        },
      },
      [
        createElement("input", {
          on: {
            input: (e: any) => {
              this.props.setJoinNickName(e.target.value);
            },
          },
          placeholder: "Enter Your NickName",
          value: this.props.nickname,
          class: [
            "border-2",
            "bg-transparent",
            // "bg-[var(--background-color)]",
            "w-full",
            "max-w-full",
            "md:max-w-full",
            "rounded-3xl",
            "outline-none",
            "border-[var(--dark-black)]",
            "border-opacity-[30%]",
            "px-3",
            "md:px-4",
            "py-2",
            "md:py-3",
            "text-[var(--dark-black)]",
            "focus:outline-none",
            "text-sm",
            "md:text-base",
          ],
        }),
        createElement("input", {
          on: {
            input: (e: any) => {
              this.props.setJoinCode(e.target.value);
            },
          },
          placeholder: "Enter Your Code",
          value: this.props.code,

          class: [
            "border-2",
            "bg-transparent",
            "w-full",
            "max-w-full",
            "md:max-w-full",
            "rounded-3xl",
            "outline-none",
            "border-[var(--dark-black)]",
            "border-opacity-[30%]",
            "text-[var(--dark-black)]",
            "px-3",
            "md:px-4",
            "py-2",
            "md:py-3",
            "text-[#878787]",
            "focus:outline-none",
            "text-sm",
            "md:text-base",
          ],
        }),
        createElement(
          "div",
          {
            class: [
              "flex-row",
              "items-center",
              "justify-between",
              "w-full",
              "h-full",
              "mt-4",
            ],
          },
          [
            createElement("input", {
              on: {
                input: (e: any) => {
                  this.props.setJoinId(e.target.value);
                },
              },
              placeholder: "ID 215",
              value: this.props.id,
              class: [
                "border-2",
                "bg-transparent",
                "w-1/2",
                "max-w-full",
                "md:max-w-full",
                "rounded-3xl",
                "outline-none",
                "border-[var(--dark-black)]",
                "border-opacity-[30%]",
                "text-[var(--dark-black)]",
                "px-3",
                "md:px-4",
                "py-2",
                "md:py-3",
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
                  click: () => this.props.joinTournament(),
                },
                class: [
                  "mx-auto",
                  "text-[var(--dark-black)]",
                  "bg-[var(--light-yellow)]",
                  "w-[40%]",
                  "w-1/2",
                  "rounded-3xl",
                  "justify-center",
                  "outline-none",
                  "border-2",
                  "border-[var(--dark-black)]",
                  "border-opacity-[30%]",
                  "py-[12px]",
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
        ),
      ]
    );
  },
  handleClickOutSide(
    this: IComponent<void, TournamentJoinButtonProps>,
    e: MouseEvent
  ) {
    const element = this.getHtmlElement;
    if (element && !element.contains(e.target as Node)) {
      this.props.resetOptions();
    }
  },
});

export default TournamentJoinButton;
