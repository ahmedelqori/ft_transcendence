import enhancedFetch from "@/Hooks/fetch";
import { createElement, defineComponent, IComponent } from "@/uccello/Uccello";

interface FriendRequestNotifProps {
  username: string;
  avatar: string;
  id: number;
  notifId: number;
  deleteNotif: (id: number) => void;
}

const FriendRequestNotif = defineComponent<void, FriendRequestNotifProps>({
  render(
    this: IComponent<void, FriendRequestNotifProps> & {
      handleAcceptButton: () => Promise<void>;
      handleDeclineButton: () => Promise<void>;
    }
  ) {
    return createElement("div", { class: ["flex-row", "gap-[20px]"] }, [
      createElement("img", {
        src: this.props.avatar,
        class: ["w-[40px]", "rounded-full"],
      }),
      createElement("div", { class: ["mr-auto", "items-start"] }, [
        createElement("p", { class: ["text-[14px]"] }, [this.props.username]),
        createElement(
          "span",
          { class: ["text-[var(--light-grey)]", "text-[10px]"] },
          ["Send Request"]
        ),
      ]),
      createElement("div", { class: ["flex-row", "gap-2"] }, [
        createElement(
          "button",
          {
            on: {
              click: async () => await this.handleAcceptButton(),
            },
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
          },
          ["Accept"]
        ),
        createElement(
          "button",
          {
            on: {
              click: async () => await this.handleDeclineButton(),
            },
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
          },
          ["Decline"]
        ),
      ]),
    ]);
  },
  async handleAcceptButton(
    this: IComponent<void, FriendRequestNotifProps> & {
      removeNotif: () => Promise<void>;
    }
  ) {
    try {
      await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/friends/${
          this.props.id
        }/request/accept`,
        { method: "POST" }
      );
      await this.removeNotif();
    } catch (err) {
      console.log(err);
    }
  },
  async handleDeclineButton(
    this: IComponent<void, FriendRequestNotifProps> & {
      removeNotif: () => Promise<void>;
    }
  ) {
    try {
      await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/friends/${
          this.props.id
        }/request/reject`,
        { method: "POST" }
      );
      await this.removeNotif();
    } catch (err) {
      console.log(err);
    }
  },
  async removeNotif(this: IComponent<void, FriendRequestNotifProps>) {
    try {
      await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/notif/${this.props.notifId}`,
        { method: "DELETE" }
      );
      this.props.deleteNotif(this.props.notifId);
    } catch (err) {
      console.log(err);
    }
  },
});

export default FriendRequestNotif;
