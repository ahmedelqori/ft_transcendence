import {
  createElement,
  defineComponent,
  eventBus,
  type IComponent,
} from "@/uccello/Uccello.js";
import Conversation from "./Conversation/Conversation.js";
import Friends from "./Friends/Friends.js";
import enhancedFetch from "@/Hooks/fetch.js";

interface ChatInterfaceState {
  showSelectedUser: string | null;
  userId: number;
  showConversation: boolean;
  isMobile: boolean;
}

const ChatInterface = defineComponent<ChatInterfaceState>({
  async onMounted(this: IComponent<ChatInterfaceState>) {
    if (window.innerWidth <= 768)
      this.updateState({ isMobile: true, showConversation: false });
    else this.updateState({ isMobile: false, showConversation: true });
    window.addEventListener("resize", (event) => {
      if (window.innerWidth <= 768)
        this.updateState({ isMobile: true, showConversation: false });
      else this.updateState({ isMobile: false, showConversation: true });
    });
  },
  state(): ChatInterfaceState {
    return {
      showSelectedUser: "",
      showConversation: true,
      isMobile: false,
      userId: -1,
    };
  },
  render(this: IComponent<ChatInterfaceState>) {
    return createElement(
      "section",
      {
        class: [
          "flex",
          "z-10",
          "gap-4",
          "w-full",
          "relative",
          "border-2",
          "py-8",
          "px-6",
          // "h-[880px]",
          "max-lg:py-4",
          "h-[75vh]",
          "max-lg:h-full",
          "rounded-[30px]",
          "border-[#878787]",
          "border-opacity-[30%]",
        ],
      },
      [
        this.state.isMobile && this.state.showSelectedUser?.length
          ? null
          : createElement(Friends, {
              setShowSelectedUser: (user: string) => {
                this.updateState({ showSelectedUser: user });
              },
              setUserId: (id: number) => {
                this.updateState({ userId: id });
                eventBus.emit("get:messages");
              },
            }),
        this.state.isMobile && this.state.showConversation
          ? createElement(Conversation, {
              username: this.state.showSelectedUser,
              userId: this.state.userId,
            })
          : !this.state.isMobile
          ? createElement(Conversation, {
              username: this.state.showSelectedUser,
              userId: this.state.userId,
            })
          : this.state.isMobile && this.state.showSelectedUser?.length
          ? createElement(Conversation, {
              username: this.state.showSelectedUser,
              userId: this.state.userId,
            })
          : null,
      ]
    );
  },
});

export default ChatInterface;
