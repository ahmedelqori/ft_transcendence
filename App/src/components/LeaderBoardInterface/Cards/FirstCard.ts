import {
  createElement,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";

interface FirstCardProps {
  id: number;
  xp: number;
  username: string;
  avatar: string;
}

const FirstCard = defineComponent<void, FirstCardProps>({
  render(this: IComponent<void, FirstCardProps>) {
    return createElement(
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
          src: this.props.avatar,
          class: ["rounded-full", "w-[100px]"],
        }),
        createElement("h4", {}, [this.props.username]),
        createElement("h4", { class: ["text-[var(--light-grey)]"] }, [
          this.props.xp + " pts",
        ]),
        createElement("img", {
          class: ["absolute", "w-[50px]", "top-[90px]", "right-[24px]"],
          src: "assets/GoldenMedal.png",
        }),
      ]
    );
  },
});

export default FirstCard;
