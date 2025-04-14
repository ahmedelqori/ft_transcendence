import {
  createElement,
  defineComponent,
  IComponent,
} from "../../../../uccello/Uccello.js";

interface SendState {
  inputValue: string;
}

interface SendProps {
  socket: any;
  messages: (string | null)[];
  onSendMessage: (message: string) => void;
}

const SendMessage = defineComponent<SendState, SendProps>({
  onMounted(this: IComponent<SendState, SendProps>) {
    // const socket = new WebSocket("ws://localhost:3001");
    // this.updateState({ socket: socket });
  },
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
  handleSendMessage(
    this: IComponent<SendState, SendProps> & { sendMessage: () => void }
  ) {
    if (this.state.inputValue && this.state.inputValue.trim().length) {
      this.props.onSendMessage(this.state.inputValue);
      if (this.props.socket.readyState === WebSocket.OPEN) {
        this.props.socket.send(
          this.state.inputValue + " answer me in one sentence"
        );
      }
      this.updateState({ inputValue: "" });
    } else this.updateState({ inputValue: "" });
  },
});

export default SendMessage;
