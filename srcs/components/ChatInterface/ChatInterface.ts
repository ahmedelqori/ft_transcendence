import {
  createElement,
  defineComponent,
  IComponent,
} from "../../uccello/Uccello.js";
import Conversation from "./Conversation/Conversation.js";
import Friends from "./Friends/Friends.js";

interface ChatInterfaceState {
  showSelectedUser: string | null;
}

const ChatInterface = defineComponent<ChatInterfaceState>({
  state(): ChatInterfaceState {
    return {
      showSelectedUser: "",
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
          "h-[880px]",
          "max-lg:h-[600px]",
          "rounded-[30px]",
          "border-[#878787]",
          "border-opacity-[30%]",
        ],
      },
      [
        createElement(Friends, {
          setShowSelectedUser: (user: string) => {
            this.updateState({ showSelectedUser: user });
          },
        }),
        createElement(Conversation, {
          username: this.state.showSelectedUser,
        }),
      ]
    );
  },
});

export default ChatInterface;
