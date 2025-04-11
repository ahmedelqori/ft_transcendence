import {
  createElement,
  createFragment,
  defineComponent,
  IComponent,
} from "../../../../uccello/Uccello.js";
import ReceivedMessage from "./ReceivedMessage/ReceivedMessage.js";
import SentMessage from "./SentMessage/SentMessage.js";

interface MessagesProps {
  messages: (string | null)[];
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
        // createElement("div", {}, [
        //   "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        // ]),
        createFragment([
          ...this.props.messages.map((e) =>
            createElement(SentMessage, { message: e })
          ),
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
