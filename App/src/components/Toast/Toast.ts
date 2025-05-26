import enhancedFetch from "@/Hooks/fetch";
import { router } from "@/router/Router";
import {
  createElement,
  createFragment,
  defineComponent,
  eventBus,
  IComponent,
} from "@/uccello/Uccello";

interface ToastState {
  NotifComponent: any;
}

interface RequestReceivedParams {
  username: string;
  avatar: string;
  id: number;
}

interface DirectMessageParams {
  username: string;
  avatar: string;
  id: number;
}

const Toast = defineComponent<ToastState>({
  onMounted(this: IComponent<ToastState>) {
    eventBus.on("notif:requestReceived", (data: RequestReceivedParams) => {
      this.updateState({
        NotifComponent: createElement(FriendRequest, {
          avatar: data.avatar,
          username: data.username,
          id: data.id,
        }),
      });
      setTimeout(() => {
        eventBus.emit("add:notif", { type: "friendRequest", data });
        this.updateState({ NotifComponent: null });
      }, 6000);
    });
    eventBus.on(
      "notif:inviteToMatch",
      (data: RequestReceivedParams & { gameId: number }) => {
        this.updateState({
          NotifComponent: createElement(InviteToMatch, {
            avatar: data.avatar,
            username: data.username,
            id: data.id,
            gameId: data.gameId,
          }),
        });
        setTimeout(() => {
          eventBus.emit("add:notif", { type: "friendRequest", data });
          this.updateState({ NotifComponent: null });
        }, 6000);
      }
    );
    eventBus.on("reset:notif", () => {
      this.updateState({ NotifComponent: null });
    });
    eventBus.emit("notif:directMessage", (data: DirectMessageParams) => {
      this.updateState({
        NotifComponent: createElement(DirectMessage, {
          avatar: data.avatar,
          username: data.username,
          id: data.id,
        }),
      });
      setTimeout(() => {
        this.updateState({ NotifComponent: null });
      }, 6000);
    });
  },
  state() {
    return { NotifComponent: null };
  },
  render(this: IComponent<ToastState>) {
    return this.state.NotifComponent
      ? createElement(
          "div",
          {
            class: [
              "absolute",
              "z-40",
              "right-4",
              "bottom-16",
              "w-fit",
              "px-4",
              "py-2",
              "bg-[var(--dark-black)]",
              "rounded-[30px]",
            ],
          },
          [this.state.NotifComponent ? this.state.NotifComponent : null]
        )
      : createFragment([]);
  },
});

// =================================================================== //
interface DirectMessageProps {
  avatar: any;
  username: string;
  id: number;
}
const DirectMessage = defineComponent<void, DirectMessageProps>({
  render(this: IComponent<void, FriendRequestProps>) {
    return createElement("div", { class: ["flex-row", "gap-[20px]"] }, [
      createElement("img", {
        width: "40px",
        height: "40px",
        src: this.props.avatar || "/assets/default.webp",
        class: ["w-[40px]", "h-[40px]", "rounded-full"],
      }),
      createElement("div", { class: ["mr-auto", "items-start"] }, [
        createElement("p", { class: ["text-xs"] }, [
          this.props.username || "unknown",
        ]),
        createElement(
          "span",
          { class: ["text-[var(--light-grey)]", "text-[10px]"] },
          ["Send Request"]
        ),
      ]),
    ]);
  },
});

// =================================================================== //
interface FriendRequestProps {
  avatar: any;
  username: string;
  id: number;
}

export const FriendRequest = defineComponent<void, FriendRequestProps>({
  render(
    this: IComponent<void, FriendRequestProps> & {
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
          click: () => {
            router.navigateTo(`/profile/${this.props.username}`);
            eventBus.emit("reset:notif");
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
          ["Send Request"]
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
  async handleAcceptRequest(this: IComponent<void, FriendRequestProps>) {
    try {
      await enhancedFetch.fetch(
        `https://www.meedivo.me/api/friends/${this.props.id}/request/accept`,
        { method: "POST" }
      );
      eventBus.emit("update:friends");
      eventBus.emit("reset:notif");
    } catch (err) {
      console.log(err);
    }
  },
  async handleDeclineRequest(this: IComponent<void, FriendRequestProps>) {
    console.log(this.props);
    try {
      await enhancedFetch.fetch(
        `https://www.meedivo.me/api/friends/${this.props.id}/request/reject`,
        { method: "POST" }
      );
      eventBus.emit("reset:notif");
    } catch (err) {
      console.log(err);
    }
  },
});

// =================================================================== //

interface InviteToMatchProps {
  avatar: any;
  username: string;
  id: number;
  gameId: number;
}

export const InviteToMatch = defineComponent<void, InviteToMatchProps>({
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
          click: () => {
            router.navigateTo(`/profile/${this.props.username}`);
            eventBus.emit("reset:notif");
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
  async handleAcceptRequest(this: IComponent<void, InviteToMatchProps>) {
    try {
      await enhancedFetch.fetch(
        `http://192.168.137.118:3000/api/games/accept/${this.props.gameId}`,
        {
          method: "PUT",
        }
      );
      eventBus.emit("reset:notif");
      router.navigateTo(`/game/${this.props.gameId}`);
    } catch (err) {
      console.log(err);
    }
  },
  async handleDeclineRequest(this: IComponent<void, InviteToMatchProps>) {
    try {
      await enhancedFetch.fetch(
        `http://192.168.137.118:3000/api/games/decline/${this.props.gameId}`,
        { method: "PUT" }
      );
      eventBus.emit("reset:notif");
    } catch (err) {
      console.log(err);
    }
  },
});

export default Toast;
