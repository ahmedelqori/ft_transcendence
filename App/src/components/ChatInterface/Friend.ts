import enhancedFetch from "@/Hooks/fetch";
import { router } from "@/router/Router.js";
import {
  createElement,
  defineComponent,
  eventBus,
  type IComponent,
} from "@/uccello/Uccello.js";

interface FriendProps {
  id: number;
  avatar: any;
  username: string;
  setOption: (str: string) => void;
  setUser: (str: string) => void;
  setSelectedFriend: (str: string) => void;
  setFriendUserId: (id: number) => void;
  relation: string;
}

interface FriendState {
  xPosition: number;
  yPosition: number;
  showContextMenu: boolean;
  lastMsg: string;
  time: string;
}

const Friend = defineComponent<FriendState, FriendProps>({
  async onMounted(
    this: IComponent<FriendState> & {
      handleClickOutSide: (e: MouseEvent) => void;
      getLastMessage: () => Promise<void>;
    }
  ) {
    this.handleClickOutSide = this.handleClickOutSide.bind(this);
    document.addEventListener("mousedown", this.handleClickOutSide);
    await this.getLastMessage();
  },
  state() {
    return {
      xPosition: 0,
      yPosition: 0,
      showContextMenu: false,
      lastMsg: "Send me a message",
      time: "",
    };
  },
  render(this: IComponent<FriendState, FriendProps>) {
    return createElement(
      "div",
      {
        class: [
          "w-full",
          "h-[70px]",
          "flex-row",
          "justify-between",
          "text-[var(--light-grey)]",
          "hover:bg-[#878787]",
          "hover:bg-opacity-[10%]",
          "p-2",
          "rounded-[14px]",
          "border-2",
          "border-transparent",
          "focus:border-[#828c3a]",
          "cursor-pointer",
          "relative",
          this.props.relation === "blocked" ? "opacity-[30%]" : "none",
        ],
        on: {
          click: () => {
            this.props.setSelectedFriend(this.props.username);
            this.props.setFriendUserId(this.props.id);
            eventBus.emit("get:messages");
          },
        },
      },
      [
        createElement(
          "div",
          {
            class: ["flex-row", "gap-3", "z-20", "text-xl"],
          },
          [
            createElement("img", {
              src: this.props.avatar,
              class: [
                "w-[60px]",
                "h-[60px]",
                "rounded-[50%]",
                "max-lg:h-[30px]",
                "max-lg:w-[30px]",
              ],
            }),
            createElement("div", { class: "items-start" }, [
              createElement("p", { class: ["text-white", "max-lg:text-sm"] }, [
                this.props.username,
              ]),
              createElement(
                "p",
                {
                  class: [
                    "text-sm",
                    "max-lg:text-xs",
                    "truncate",
                    "overflow-hidden",
                    "whitespace-nowrap",
                    "max-w-xs",
                  ],
                },
                [this.state.lastMsg]
              ),
            ]),
          ]
        ),
        createElement(
          "div",
          {
            class: ["max-lg:text-sm"],
          },
          [this.state.time]
        ),
      ]
    );
  },
  handleClickOutSide(this: IComponent<FriendState>, e: MouseEvent) {
    if (!this.state) {
      console.error("Component state is undefined");
      return;
    }
    if (this.state.showContextMenu) {
      const element = this.getHtmlElement;
      if (element && !element.contains(e.target as Node)) {
        if (this.getIsMounted)
          this.updateState({
            showContextMenu: false,
          });
      }
    }
  },
  async getLastMessage(
    this: IComponent<FriendState, FriendProps> & {
      getRelativeTime: (n: string) => string;
    }
  ) {
    try {
      const responseData = await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/chat/getlast?receiveId=${
          this.props.id
        }`
      );
      const data = await responseData.json();
      console.log(data);
      if (this.getIsMounted)
        this.updateState({
          lastMsg: data.data.content,
          time: this.getRelativeTime(data.data.createdAt),
        });
    } catch (err) {}
  },

  getRelativeTime(dateString: string): string {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return `${seconds}s`;
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  },
});

export default Friend;
