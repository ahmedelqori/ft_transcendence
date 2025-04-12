import {
  createElement,
  defineComponent,
  IComponent,
} from "../../../uccello/Uccello.js";
import FriendInfoBar from "./FriendInfoBar/FriendInfoBar.js";
import Messages from "./Messages/Messages.js";
import SendMessage from "./SendMessage/SendMessage.js";

interface ConversationProps {
  username: string;
}

interface ConversationState {
  messages: (string | null)[];
}

const Conversation = defineComponent<ConversationState, ConversationProps>({
  onMounted(this: IComponent<ConversationState, ConversationProps>) {
    const socket = new WebSocket("ws://localhost:3001");

    socket.addEventListener("message", ({ data }) => {
      this.updateState({ messages: [...this.state.messages, data] });
    });
  },
  state() {
    return { messages: [] };
  },
  render(this: IComponent<ConversationState, ConversationProps>) {
    return createElement(
      "div",
      {
        class: [
          "w-[70%]",
          "h-full",
          "max-h-[750px]",
          this.props.username != "" ? "justify-between" : "justify-center",
        ],
      },

      this.props.username != ""
        ? [
            createElement(FriendInfoBar, { username: this.props.username }),
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
        : [
            createElement(
              "div",
              { class: ["items-center", "justify-center"] },
              [
                createElement(
                  "i",
                  {
                    class: [
                      "ph",
                      "ph-chats",
                      "text-[var(--light-grey)]",
                      "text-[128px]",
                      "opacity-[50%]",
                    ],
                  },
                  []
                ),
              ]
            ),
            createElement(
              "p",
              {
                class: [
                  "text-center",
                  "text-[24px]",
                  "max-w-[500px]",
                  "text-[var(--light-grey)]",
                  "opacity-[50%]",
                  "my-4",
                ],
              },
              [
                "Hey! 👋 Just clicked on your profile figured I’d say hi. You around?",
              ]
            ),
            // createElement(
            //   "p",
            //   {
            //     class: [
            //       "text-center",
            //       "text-[18px]",
            //       "max-w-[500px]",
            //       "text-[var(--light-grey)]",
            //     ],
            //   },
            //   [
            //     "Hey there! 👋 Just saw you joined — feel free to say hi or ask anything. I'm around if you wanna chat!”",
            //   ]
            // ),
          ]
    );
  },
});

export default Conversation;
