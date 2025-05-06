import {
  createElement,
  createFragment,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";
import ReceivedMessage from "./ReceivedMessage.js";
import SentMessage from "./SentMessage.js";
import { MessageInterface } from "./Conversation.js";

interface MessagesProps {
  messages: MessageInterface[];
}

const Messages = defineComponent<void, MessagesProps>({
  onMounted(this: IComponent<void, MessagesProps>) {
    const el = this.getHtmlElement;
    setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 50);
  },
  state() {},
  render(this: IComponent<void, MessagesProps>) {
    setTimeout(() => {
      this.getHtmlElement.scrollTop = this.getHtmlElement.scrollHeight;
    }, 0);
    return createElement(
      "div",
      {
        class: [
          "gap-4",
          "px-4",
          "w-full",
          "w-[90%]",
          "mt-auto",
          "items-self-end",
          "scroll-smooth",
          "overflow-scroll",
          "overflow-x-hidden",
          "[&::-webkit-scrollbar]:w-1",
          "[&::-webkit-scrollbar-track]:rounded-full",
          "[&::-webkit-scrollbar-track]:bg-gray-100",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-thumb]:bg-gray-300",
          "dark:[&::-webkit-scrollbar-track]:bg-transparent",
          "dark:[&::-webkit-scrollbar-thumb]:bg-[#ddf247]",
          "dark:[&::-webkit-scrollbar-thumb]:bg-opacity-[70%]",
        ],
      },
      [
        createFragment([
          ...this.props.messages.map((e) => {
            if (e.received)
              return createElement(ReceivedMessage, {
                message: e.content,
              });
            else return createElement(SentMessage, { message: e.content });
          }),
        ]),
      ]
    );
  },
});

export default Messages;

// createElement(ReceivedMessage),
// createElement(ReceivedMessage),
// createElement(SentMessage),
// createElement(SentMessage),
// createElement(ReceivedMessage),
// createElement(ReceivedMessage),
// createElement(ReceivedMessage),
// createElement(ReceivedMessage),
// createElement(SentMessage),
// createElement(SentMessage),
// createElement(ReceivedMessage),
// createElement(ReceivedMessage),
// createElement(SentMessage),
// createElement(SentMessage),
// createElement(ReceivedMessage),
// createElement(ReceivedMessage),
// createElement(ReceivedMessage),
// createElement(ReceivedMessage),
// createElement(SentMessage),
// createElement(SentMessage),
// createElement(ReceivedMessage),
// createElement(ReceivedMessage),
// createElement(SentMessage),
// createElement(SentMessage),
// createElement(ReceivedMessage),
// createElement(ReceivedMessage),
// createElement(ReceivedMessage),
// createElement(ReceivedMessage),
// createElement(SentMessage),
// createElement(SentMessage),
// createElement(SentMessage),
// createElement(ReceivedMessage),
// createElement(ReceivedMessage),
// createElement(SentMessage),
// createElement(SentMessage),
// createElement(ReceivedMessage),
// createElement(ReceivedMessage),
// createElement(ReceivedMessage),
// createElement(ReceivedMessage),
// createElement(SentMessage),
// createElement(SentMessage),
// createElement(ReceivedMessage),
// createElement(ReceivedMessage),
// createElement(SentMessage),
// createElement(SentMessage),
// createElement(ReceivedMessage),
// createElement(ReceivedMessage),
// createElement(ReceivedMessage),
// createElement(ReceivedMessage),
// createElement(SentMessage),
// createElement(SentMessage),
