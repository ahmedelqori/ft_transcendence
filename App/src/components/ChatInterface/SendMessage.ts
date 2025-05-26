import enhancedFetch from "@/Hooks/fetch";
import {
  createElement,
  defineComponent,
  eventBus,
  type IComponent,
} from "@/uccello/Uccello.js";

interface SendState {
  inputValue: string;
}

interface SendProps {
  socket: any;
  id: number;
  messages: (string | null)[];
  onSendMessage: (message: string) => void;
}

const SendMessage = defineComponent<SendState, SendProps>({
  onMounted(this: IComponent<SendState, SendProps>) {},
  state() {
    return { inputValue: "", socket: null };
  },
  render(
    this: IComponent<SendState, SendProps> & { handleSendMessage: () => void }
  ) {
    return createElement(
      "div",
      {
        class: [
          "relative",
          "w-[90%]",
          "flex",
          "items-center",
          "flex-row",
          "mb-2",
          "mt-6",
          "max-lg:mb-0",
          "bg-[#878787]",
          "bg-opacity-[10%]",
          "rounded-[14px]",
        ],
      },
      [
        createElement("input", {
          value: this.state.inputValue,
          placeholder: "Message...",
          autofocus: true,
          on: {
            input: ({ target }) => {
              this.updateState({ inputValue: target.value });
            },
            keydown: (e) => {
              if (e.key == "Enter") {
                this.handleSendMessage();
              }
            },
          },
          class: [
            "rounded-[14px]",
            "border-2",
            "w-full",
            "h-[70px]",
            "bg-transparent",
            "border-[#878787]",
            "px-4",
            "py-4",
            "pr-[60px]",
            "text-[#878787]",
            "focus:outline-none",
            "border-opacity-[30%]",
            "max-lg:h-[40px]",
            "max-lg:text-sm",
          ],
        }),
        createElement("i", {
          class: [
            "ph",
            "ph-paper-plane-tilt",
            "text-xl",
            "text-[#878787]",
            "absolute",
            "right-[20px]",
            "hover:text-[#828c3a]",
          ],
          on: {
            click: this.handleSendMessage,
          },
        }),
      ]
    );
  },
  async handleSendMessage(
    this: IComponent<SendState, SendProps> & { sendMessage: () => void }
  ) {
    if (this.state.inputValue && this.state.inputValue.trim().length) {
      const valueOfInput = this.state.inputValue;
      this.updateState({ inputValue: "" });
      this.props.onSendMessage(valueOfInput);
      eventBus.emit("scroll:height");
      this.props.socket.send(
        JSON.stringify({
          type: "sendMessage",
          receiverId: this.props.id,
          content: valueOfInput,
        })
      );
      try {
        // await enhancedFetch.fetch(
        //   `http://192.168.137.118:3000/api/messages/send/${this.props.id}`,
        //   {
        //     method: "POST",
        //     body: JSON.stringify({ message: valueOfInput }),
        //   }
        // );
      } catch (err) {
        console.log(err);
      }
    } else this.updateState({ inputValue: "" });
  },
});

export default SendMessage;
