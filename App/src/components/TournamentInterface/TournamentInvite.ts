import enhancedFetch from "@/Hooks/fetch";
import { createElement, defineComponent, IComponent } from "@/uccello/Uccello";

interface TournamentInviteProps {
  inviteUsers: boolean;
  tournamentId: string;
  setInviteUsers: () => void;
}
interface TournamentInviteStat {
  friends: any[];
}
const TournamentInvite = defineComponent<
  TournamentInviteStat,
  TournamentInviteProps
>({
  async onMounted(
    this: IComponent<TournamentInviteStat, TournamentInviteProps> & {
      handleClickOutSide: (e: MouseEvent) => void;
    }
  ) {
    this.handleClickOutSide = this.handleClickOutSide.bind(this);
    document.addEventListener("mousedown", this.handleClickOutSide);
    try {
      const response = await enhancedFetch.fetch(
        "https://www.meedivo.me/api/account/users/?n=20&sort=newest"
      );
      const data = await response.json();
      if (this.getIsMounted) this.updateState({ friends: data });
    } catch (err) {
      console.log(err);
    }
  },
  onUnmounted(
    this: IComponent<TournamentInviteStat, TournamentInviteProps> & {
      handleShowNotification: (e: MouseEvent) => void;
      handleClickOutSide: (e: MouseEvent) => void;
    }
  ) {
    document.removeEventListener("mousedown", this.handleClickOutSide);
  },
  state() {
    return { friends: [] };
  },
  render(this: IComponent<TournamentInviteStat, TournamentInviteProps>) {
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
      this.state.friends.map((e: any) =>
        createElement(TournamentInviteUser, {
          id: e.id,
          username: e.username,
          avatar_url: e.avatar_url,
          tournamentId: this.props.tournamentId,
        })
      )
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

interface TournamentInviteUserProps {
  id: number;
  username: string;
  avatar_url: string;
  tournamentId: string;
}
interface TournamentInviteUserState {
  icon: string;
}

const TournamentInviteUser = defineComponent<
  TournamentInviteUserState,
  TournamentInviteUserProps
>({
  state() {
    return { icon: "ph-user-plus" };
  },
  render(
    this: IComponent<TournamentInviteUserState, TournamentInviteUserProps> & {
      handleInviteTournamentButton: () => Promise<void>;
    }
  ) {
    return createElement(
      "div",
      {
        class: ["flex-row", "justify-start", "w-full", "h-full", "gap-6"],
      },
      [
        createElement("img", {
          src: this.props.avatar_url || "/assets/default.webp",
          width: "40",
          height: "40",
          class: ["rounded-full"],
        }),
        createElement("p", { class: ["text-lg", "text-[var(--light-grey)]"] }, [
          this.props.username.substring(0, 8),
        ]),
        createElement("i", {
          class: ["ph", "ml-auto", this.state.icon, "text-xl"],
          on: {
            click: () => this.handleInviteTournamentButton(),
          },
        }),
      ]
    );
  },
  async handleInviteTournamentButton(
    this: IComponent<TournamentInviteUserState, TournamentInviteUserProps>
  ) {
    try {
      const res = await enhancedFetch.fetch(
        `https://www.meedivo.me/api/tournament/${this.props.tournamentId}/invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ player_id: this.props.id }),
        }
      );
      const data = await res.json();
      console.log(data);
      if (this.getIsMounted) this.updateState({ icon: "ph-check-circle" });
    } catch (err) {}
  },
});
