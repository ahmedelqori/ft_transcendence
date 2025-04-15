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
          "max-h-[860px]",
          "max-lg:max-h-[90%]",
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
