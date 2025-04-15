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
  socket: any;
  online: boolean;
  intervalId: any;
}

const Conversation = defineComponent<ConversationState, ConversationProps>({
  onMounted(
    this: IComponent<ConversationState, ConversationProps> & {
      setupWebSocket: () => void;
    }
  ) {
    this.state.intervalId = null;
    this.setupWebSocket.call(this);
  },
  state() {
    return { messages: [], socket: null, online: false, intervalId: null };
  },
  render(this: IComponent<ConversationState, ConversationProps>) {
    return createElement(
      "div",
      {
        class: [
          "w-[70%]",
          "h-full",
          "max-h-[860px]",
          this.props.username != "" ? "justify-between" : "justify-center",
        ],
      },

      this.props.username != ""
        ? [
            createElement(FriendInfoBar, {
              username: this.props.username,
              online: this.state.online,
            }),
            createElement(Messages, { messages: this.state.messages }),
            createElement(SendMessage, {
              messages: this.state.messages,
              onSendMessage: (message: string) => {
                this.updateState({
                  messages: [...this.state.messages, message],
                });
              },
              socket: this.state.socket,
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
                  "mt-4",
                ],
              },
              [
                "Hey! 👋 Just clicked on your profile figured I’d say hi. You around?",
              ]
            ),
          ]
    );
  },
  setupWebSocket(
    this: IComponent<ConversationState, ConversationProps> & {
      setupWebSocket: () => void;
    }
  ) {
    this.state.socket = new WebSocket("ws://localhost:3001");

    this.state.socket.addEventListener("message", ({ data }: { data: any }) => {
      clearInterval(this.state.intervalId);
      data = JSON.parse(data);
      this.updateState({
        messages: [
          ...this.state.messages,
          data.candidates[0].content.parts[0].text + "/[]1337",
        ],
      });
    });

    this.state.socket.addEventListener("open", () => {
      this.updateState({ online: true });
    });

    this.state.socket.addEventListener("close", () => {
      this.updateState({ online: false });

      this.state.intervalId = setInterval(() => {
        clearInterval(this.state.intervalId);
        this.setupWebSocket.call(this);
      }, 1000);
    });
  },
});

export default Conversation;
