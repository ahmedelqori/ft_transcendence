import {
  createElement,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";

interface SecondCardState {
  isLoading: boolean;
}

const SecondCard = defineComponent<SecondCardState>({
  state() {
    return { isLoading: true };
  },
  onMounted(this: IComponent<SecondCardState>) {
    setTimeout(() => {
      this.updateState({ isLoading: false });
    }, 3000);
  },
  render(this: IComponent<SecondCardState>) {
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
              "mt-[40px]",
              "gap-4",
              "relative",
              "border-[2px]",
              "border-opacity-[30%]",
              "border-[#C0C0C0]",
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
              "w-[165px]",
              "h-fit",
              "rounded-[20px]",
              "px-[30px]",
              "py-[20px]",
              "mt-[40px]",
              "gap-4",
              "relative",
              "border-[2px]",
              "border-opacity-[30%]",
              "border-[#C0C0C0]",
              "hover:scale-[105%]",
              "duration-75",
              "flex",
              "flex-col",
              "items-center",
            ],
          },
          [
            createElement("img", {
              src: "assets/afanidi.png",
              class: ["rounded-full", "w-[100px]"],
            }),
            createElement("h4", {}, ["afanidi"]),
            createElement("h4", { class: ["text-[var(--light-grey)]"] }, [
              "1250 pts",
            ]),
            createElement("img", {
              class: ["absolute", "w-[50px]", "top-[90px]", "right-[15px]"],
              src: "assets/MetalMedal.png",
            }),
          ]
        );
  },
});

export default SecondCard;
