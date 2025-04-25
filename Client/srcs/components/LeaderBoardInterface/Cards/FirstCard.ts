import {
  createElement,
  defineComponent,
  IComponent,
} from "../../../uccello/Uccello.js";

interface FirstCardState {
  isLoading: boolean;
}

const FirstCard = defineComponent<FirstCardState>({
  state() {
    return { isLoading: true };
  },
  onMounted(this: IComponent<FirstCardState>) {
    setTimeout(() => {
      this.updateState({ isLoading: false });
    }, 3000);
  },
  render(this: IComponent<FirstCardState>) {
    return this.state.isLoading
      ? createElement(
          "div",
          {
            class: [
              "w-[210px]",
              "h-fit",
              "rounded-[20px]",
              "px-[30px]",
              "py-[20px]",
              "gap-3",
              "mt-[-20px]",
              "relative",
              "border-[1px]",
              "border-opacity-[30%]",
              "border-[var(--light-yellow)]",
              "animate-pulse",
              "flex",
              "flex-col",
              "items-center",
            ],
          },
          [
            createElement("div", {
              class: [
                "bg-gray-300",
                "rounded-full",
                "w-[100px]",
                "h-[100px]",
                "mb-2",
              ],
            }),
            createElement("div", {
              class: ["bg-gray-300", "rounded-md", "h-5", "w-1/2", "mb-1"],
            }),
            createElement("div", {
              class: ["bg-gray-300", "rounded-md", "h-4", "w-2/3", "mb-4"],
            }),
          ]
        )
      : createElement(
          "div",
          {
            class: [
              "w-[210px]",
              "h-fit",
              "rounded-[20px]",
              "px-[30px]",
              "py-[20px]",
              "gap-3",
              "mt-[-20px]",
              "relative",
              "cursor-pointer",
              "border-[1px]",
              "border-opacity-[30%]",
              "border-[var(--light-yellow)]",
              "text-[20px]",
              "hover:scale-[105%]",
              "duration-75",
              "flex",
              "flex-col",
              "items-center",
            ],
          },
          [
            createElement("img", {
              src: "../../../../public/assets/relhamma.png",
              class: ["rounded-full", "w-[100px]"],
            }),
            createElement("h4", {}, ["relhamma"]),
            createElement("h4", { class: ["text-[var(--light-grey)]"] }, [
              "1354 pts",
            ]),
            createElement("img", {
              class: ["absolute", "w-[50px]", "top-[90px]", "right-[24px]"],
              src: "../../../../public/assets/GoldenMedal.png",
            }),
          ]
        );
  },
});

export default FirstCard;
