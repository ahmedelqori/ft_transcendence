import { createElement, defineComponent, IComponent } from "@/uccello/Uccello";

interface TournamentInviteProps {
  inviteUsers: boolean;
  setInviteUsers: () => void;
}

const TournamentInvite = defineComponent<void, TournamentInviteProps>({
  async onMounted(
    this: IComponent<void, TournamentInviteProps> & {
      handleClickOutSide: (e: MouseEvent) => void;
    }
  ) {
    this.handleClickOutSide = this.handleClickOutSide.bind(this);
    document.addEventListener("mousedown", this.handleClickOutSide);
  },
  onUnmounted(
    this: IComponent<void, TournamentInviteProps> & {
      handleShowNotification: (e: MouseEvent) => void;
      handleClickOutSide: (e: MouseEvent) => void;
    }
  ) {
    document.removeEventListener("mousedown", this.handleClickOutSide);
  },
  render(this: IComponent<void, TournamentInviteProps>) {
    return createElement(
      "div",
      {
        class: [
          this.props.inviteUsers ? "flex" : "hidden",
          "absolute",
          "top-1/2",
          "left-1/2",
          "transform",
          "-translate-x-1/2",
          "-translate-y-1/2",
          "backdrop-blur",
          "w-[300px]",
          "rounded-[30px]",
          "py-4",
          "px-8",
          "gap-4",
          "max-h-[400px]",
          "overflow-y-auto",
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
        ...Array(100)
          .fill(0)
          .map((e) =>
            createElement(
              "div",
              {
                class: [
                  "flex-row",
                  "justify-start",
                  "w-full",
                  "h-full",
                  "gap-6",
                ],
              },
              [
                createElement("img", {
                  src: "/assets/default.webp",
                  width: "40",
                  height: "40",
                  class: ["rounded-full"],
                }),
                createElement(
                  "p",
                  { class: ["text-lg", "text-[var(--light-grey)]"] },
                  ["ael-qori"]
                ),
                createElement("i", {
                  class: ["ph", "ml-auto", "ph-user-plus", "text-xl"],
                }),
              ]
            )
          ),
      ]
    );
  },

  handleClickOutSide(
    this: IComponent<void, TournamentInviteProps>,
    e: MouseEvent
  ) {
    if (this.props.inviteUsers) {
      const element = this.getHtmlElement;
      if (element && !element.contains(e.target as Node)) {
        this.props.setInviteUsers();
      }
    }
  },
});

export default TournamentInvite;
