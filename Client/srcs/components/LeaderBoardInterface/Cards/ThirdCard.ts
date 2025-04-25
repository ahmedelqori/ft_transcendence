import {
  createElement,
  defineComponent,
  IComponent,
} from "../../../uccello/Uccello.js";

interface CardState {
  isLoading: boolean;
}

const ThirdCard = defineComponent<CardState>({
  state() {
    return { isLoading: true };
  },
  onMounted(this: IComponent<CardState>) {
    setTimeout(() => {
      this.updateState({ isLoading: false });
    }, 3000);
  },
  render(this: IComponent<CardState>) {
    return this.state.isLoading
      ? createElement(
          "div",
          {
            class: [
              "w-[165px]",
              "h-fit",
              "rounded-[20px]",
              "px-[30px]",
              "py-[20px]",
              "gap-4",
              "mt-[60px]",
              "border-[1px]",
              "border-[#CD7F32]",
              "animate-pulse",
              "flex",
              "flex-col",
              "items-center",
            ],
          },
          [
            createElement("div", {
              class: ["w-[100px]", "h-[100px]", "bg-gray-300", "rounded-full"],
            }),
            createElement("div", {
              class: [
                "bg-gray-300",
                "h-[16px]",
                "w-[100px]",
                "rounded-md",
                "mt-2",
              ],
            }),
            createElement("div", {
              class: [
                "bg-gray-300",
                "h-[14px]",
                "w-[80px]",
                "rounded-md",
                "mt-1",
              ],
            }),
          ]
        )
      : createElement(
          "div",
          {
            class: [
              "w-[165px]",
              "h-fit",
              "rounded-[20px]",
              "px-[30px]",
              "py-[20px]",
              "gap-4",
              "mt-[60px]",
              "border-[1px]",
              "border-[#CD7F32]",
              "relative",
              "hover:scale-[105%]",
              "duration-75",
            ],
          },
          [
            createElement("img", {
              src: "../../../../public/assets/avatar.png",
              class: ["rounded-full", "w-[100px]"],
            }),
            createElement("h4", {}, ["sajaite"]),
            createElement("h4", { class: ["text-[var(--light-grey)]"] }, [
              "1025 pts",
            ]),
            createElement("img", {
              class: ["absolute", "w-[50px]", "top-[90px]", "right-[15px]"],
              src: "../../../../public/assets/BronzeMedal.png",
            }),
          ]
        );
  },
});

export default ThirdCard;
