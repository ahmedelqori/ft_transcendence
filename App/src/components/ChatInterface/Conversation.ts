import {
  createElement,
  defineComponent,
  eventBus,
  type IComponent,
} from "@/uccello/Uccello.js";
import FriendInfoBar from "./FriendInfoBar.js";
import Messages from "./Messages.js";
import SendMessage from "./SendMessage.js";
import enhancedFetch from "@/Hooks/fetch.js";

export interface MessageInterface {
  received: boolean;
  content: any;
}

interface ConversationProps {
  username: string;
  userId: number;
}

interface ConversationState {
  messages: MessageInterface[];
  socket: any;
  online: boolean;
  intervalId: any;
  userId: number;
  receiverId: number;
  isLoading: boolean;
}

const Conversation = defineComponent<ConversationState, ConversationProps>({
  async onMounted(
    this: IComponent<ConversationState, ConversationProps> & {
      setupWebSocket: () => void;
    }
  ) {
    this.state.intervalId = null;
    this.setupWebSocket.call(this);
    try {
      const response = await enhancedFetch.fetch(
        "https://64.23.191.17/api/account/whoami/"
      );
      let data = await response.json();
      this.updateState({ userId: data.id });
    } catch (err) {}

    eventBus.on("get:messages", async () => {
      try {
        this.updateState({ isLoading: true });
        const res = await enhancedFetch.fetch(
          `http://localhost:3000/api/messages/${this.props.userId}`,
          {
            mode: "cors",
            credentials: "include",
          }
        );
        const data = await res.json();
        this.updateState({
          messages: data.map((msg: any) => {
            return {
              content: msg.content,
              received: msg.receiverId == this.props.userId,
            };
          }),
          isLoading: false,
        });
      } catch (err) {}
    });
  },
  state() {
    return {
      messages: [],
      socket: null,
      online: false,
      intervalId: null,
      receiverId: -1,
      userId: -1,
      isLoading: true,
    };
  },
  render(this: IComponent<ConversationState, ConversationProps>) {
    return createElement(
      "div",
      {
        class: [
          "w-[70%]",
          "h-[70vh]",
          "max-md:h-[66vh]",
          "max-lg:flex-1",
          this.props.username != "" ? "justify-between" : "justify-center",
        ],
      },
      this.props.username != ""
        ? [
            createElement(FriendInfoBar, {
              username: this.props.username,
              online: this.state.online,
            }),
            !this.state.isLoading
              ? createElement(Messages, { messages: this.state.messages })
              : createElement("div", {}, ["is loading"]),
            createElement(SendMessage, {
              messages: this.state.messages,
              id: this.props.userId,
              onSendMessage: (message: string) => {
                this.updateState({
                  messages: [
                    ...this.state.messages,
                    { received: false, content: message },
                  ],
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
    this.state.socket = new WebSocket(
      `ws://localhost:3000/ws?token=${localStorage.getItem("access_token")}`
    );

    this.state.socket.addEventListener("message", ({ data }: { data: any }) => {
      data = JSON.parse(data);
      this.updateState({
        messages: [...this.state.messages, { received: true, content: data }],
      });
    });

    this.state.socket.addEventListener("open", () => {
      this.updateState({ online: true });
    });

    this.state.socket.addEventListener("close", () => {
      this.updateState({ online: false });
    });
  },
});

export default Conversation;
