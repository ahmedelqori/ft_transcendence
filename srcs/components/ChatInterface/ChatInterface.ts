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
          "h-full",
          "w-[90%]",
          "relative",
          "border-2",
          "py-[30px]",
          "px-[25px]",
          "rounded-[30px]",
          "border-[#878787]",
          "border-opacity-[30%]",
        ],
      },
      [
        createElement(Friends, {
          class: ["w-full"],
          setShowSelectedUser: (user: string) => {
            this.updateState({ showSelectedUser: user });
          },
        }),
        createElement(Conversation, {
          class: ["w-full"],
          username: this.state.showSelectedUser,
        }),
      ]
    );
  },
});

export default ChatInterface;
