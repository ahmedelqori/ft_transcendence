import enhancedFetch from "@/Hooks/fetch";
import { router } from "@/router/Router";
import {
  createElement,
  defineComponent,
  eventBus,
  IComponent,
} from "@/uccello/Uccello";

interface InviteToMatchProps {
  id: number;
  avatar: any;
  gameId: number;
  notifId: number;
  username: string;
}

export const InviteToMatchNotif = defineComponent<void, InviteToMatchProps>({
  render(
    this: IComponent<void, InviteToMatchProps> & {
      handleAcceptRequest: () => Promise<void>;
      handleDeclineRequest: () => Promise<void>;
    }
  ) {
    return createElement("div", { class: ["flex-row", "gap-[20px]"] }, [
      createElement("img", {
        width: "40px",
        height: "40px",
        src: this.props.avatar || "/assets/default.webp",
        class: ["w-[40px]", "h-[40px]", "rounded-full"],
        on: {
          click: async () => {
            await router.navigateTo(`/profile/${this.props.username}`);
            eventBus.emit("change:profile");
          },
        },
      }),
      createElement("div", { class: ["mr-auto", "items-start"] }, [
        createElement("p", { class: ["text-xs"] }, [
          this.props.username || "unknown",
        ]),
        createElement(
          "span",
          { class: ["text-[var(--light-grey)]", "text-[10px]"] },
          ["Game Invite"]
        ),
      ]),
      createElement("div", { class: ["flex-row", "gap-2"] }, [
        createElement(
          "button",
          {
            class: [
              "rounded-[16px]",
              "bg-[var(--light-yellow)]",
              "text-[var(--dark-black)]",
              "px-2",
              "py-1",
              "text-[10px]",
              "font-medium",
              "hover:scale-[104%]",
            ],
            on: {
              click: this.handleAcceptRequest,
            },
          },
          ["Accept"]
        ),
        createElement(
          "button",
          {
            class: [
              "rounded-[16px]",
              "bg-[var(--red-color)]",
              "text-[var(--dark-black)]",
              "text-[10px]",
              "px-2",
              "py-1",
              "font-medium",
              "hover:scale-[104%]",
            ],
            on: {
              click: this.handleDeclineRequest,
            },
          },
          ["Decline"]
        ),
      ]),
    ]);
  },
  async handleAcceptRequest(
    this: IComponent<void, InviteToMatchProps> & {
      removeNotif: () => Promise<void>;
    }
  ) {
    try {
      await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/games/api/games/accept/${
          this.props.gameId
        }`,
        {
          method: "PUT",
        }
      );
      await router.navigateTo(`/game/${this.props.gameId}`);
      await this.removeNotif();
    } catch (err) {
      console.log(err);
    }
  },
  async handleDeclineRequest(
    this: IComponent<void, InviteToMatchProps> & {
      removeNotif: () => Promise<void>;
    }
  ) {
    try {
      await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/games/api/games/decline/${
          this.props.gameId
        }`,
        { method: "PUT" }
      );
      await this.removeNotif();
    } catch (err) {
      console.log(err);
    }
  },
  async removeNotif(this: IComponent<void, InviteToMatchProps>) {
    try {
      await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/notif/${this.props.notifId}`,
        { method: "DELETE" }
      );
    } catch (err) {
      console.log(err);
    }
  },
});
