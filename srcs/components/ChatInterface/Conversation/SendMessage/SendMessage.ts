import {
  createElement,
  defineComponent,
  IComponent,
} from "../../../../uccello/Uccello.js";

interface SendState {
  inputValue: string;
}

interface SendProps {
  messages: (string | null)[];
  onSendMessage: (message: string) => void; // Add callback for sending messages
}

const SendMessage = defineComponent<SendState, SendProps>({
  state() {
    return { inputValue: "" };
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
    if (this.state.inputValue) {
      this.props.onSendMessage(this.state.inputValue);
      this.updateState({ inputValue: "" });
    }
  },
});

export default SendMessage;
