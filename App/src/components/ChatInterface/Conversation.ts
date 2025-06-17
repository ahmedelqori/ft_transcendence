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
import { authState } from "@/Hooks/Auth.js";
import Loader from "../Loader/Loader.js";

export interface MessageInterface {
  received: number;
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
  relation: string;
  intervalId: any;
  userId: number;
  receiverId: number;
  isLoading: boolean;
}

const Conversation = defineComponent<ConversationState, ConversationProps>({
  async onMounted(
    this: IComponent<ConversationState, ConversationProps> & {
      setupWebSocket: () => void;
      getMessages: () => Promise<void>;
      getStatus: () => Promise<void>;
      getRelation: () => Promise<string>;
    }
  ) {
    this.state.intervalId = null;
    this.setupWebSocket.call(this);
    this.updateState({ userId: authState.getState().user?.id });

    eventBus.on("get:messages", async () => {
      const status: any = await this.getRelation();
      if (status == "blocked") {
        if (this.getIsMounted)
          this.updateState({
            isLoading: false,
            online: false,
            messages: [],
          });
      } else if (this.state.socket.readyState === WebSocket.OPEN) {
        if (this.getIsMounted)
          this.updateState({
            isLoading: true,
            online: false,
          });
        this.state.socket.send(
          JSON.stringify({
            type: "getHistory",
            receiverId: this.props.userId,
            page: 1,
          })
        );
      }
    });
  },
  onUnmounted(this: IComponent<ConversationState, ConversationProps>) {
    this.state.socket.close();
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
      relation: "",
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
              relation: this.state.relation,
              isLoading: this.state.isLoading,
              friendId: this.props.userId,
            }),
            !this.state.isLoading
              ? createElement(Messages, { messages: this.state.messages })
              : createElement(Loader),
            createElement(SendMessage, {
              messages: this.state.messages,
              id: this.props.userId,
              onSendMessage: (message: string) => {
                this.updateState({
                  messages: [
                    ...this.state.messages,
                    {
                      received: this.props.userId,
                      content: message,
                    },
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
      getStatus: () => Promise<string>;
    }
  ) {
    this.updateState({
      socket: new WebSocket(
        `wss://${
          import.meta.env.VITE_DOMAIN_DEV
        }/api/chat/ws?token=${localStorage.getItem("access_token")}`
      ),
      isLoading: true,
    });
    this.state.socket.addEventListener("open", () => {});

    this.state.socket.addEventListener(
      "message",
      async ({ data }: { data: any }) => {
        data = JSON.parse(data);
        if (data.type === "messageHistory") {
          this.updateState({
            messages: data.messages.map((e: any) => {
              return { received: e.receiverId, content: e.content };
            }),
          });
        }
        if (
          data.type === "newMessage" &&
          data.message.senderId === this.props.userId
        )
          this.updateState({
            messages: [
              ...this.state.messages,
              {
                received: data.message.receiverId,
                content: data.message.content,
              },
            ],
          });

        this.updateState({
          isLoading: false,
          online: (await this.getStatus()) == "ON",
        });
        eventBus.emit("scroll:height");
      }
    );
  },
  async getRelation(this: IComponent<ConversationState, ConversationProps>) {
    try {
      const res = await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/friends/${this.props.userId}`
      );
      const data = await res.json();
      if (this.getIsMounted) this.updateState({ relation: data.status });
      return data.status;
    } catch (err) {
      console.log(err);
    }
  },
  async getStatus(this: IComponent<ConversationState, ConversationProps>) {
    try {
      const res = await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/account/${this.props.userId}`
      );
      const data = await res.json();
      return data.status;
    } catch (err) {
      console.log(err);
    }
  },
  async getMessages(this: IComponent<ConversationState, ConversationProps>) {
    try {
      this.updateState({ isLoading: true });
      const res = await enhancedFetch.fetch(
        `http://localhost:3000/api/messages/${this.props.userId}`,
        {
          mode: "cors",
          credentials: "include",
        }
      );
      if (!res.ok) throw await res.json();
      const data = await res.json();
      this.updateState({
        messages: data.map((msg: any) => {
          return {
            content: msg.content,
            received: msg.receiverId,
          };
        }),
        isLoading: false,
      });
    } catch (err) {}
  },
});

export default Conversation;
