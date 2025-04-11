import {
  createElement,
  defineComponent,
  IComponent,
} from "../../../uccello/Uccello.js";
import FriendInfoBar from "./FriendInfoBar/FriendInfoBar.js";
import Messages from "./Messages/Messages.js";
import SendMessage from "./SendMessage/SendMessage.js";

interface ConversationState {
  messages: (string | null)[];
}

const Conversation = defineComponent<ConversationState>({
  state() {
    return { messages: [] };
  },
  render(this: IComponent<ConversationState>) {
    return createElement(
      "div",
      {
        class: ["w-[70%]", "h-full", "max-h-[750px]"],
      },
      [
        createElement(FriendInfoBar),
        createElement(Messages, { messages: this.state.messages }),
        createElement(SendMessage, {
          messages: this.state.messages,
          onSendMessage: (message: string) => {
            this.updateState({
              messages: [...this.state.messages, message],
            });
          },
        }),
      ]
    );
  },
});

export default Conversation;
