import {
  createElement,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";

interface SecondCardProps {
  id: number;
  xp: number;
  username: string;
  avatar: string;
}

const SecondCard = defineComponent<void, SecondCardProps>({
  render(this: IComponent<void, SecondCardProps>) {
    return createElement(
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
          src: this.props.avatar,
          class: ["rounded-full", "w-[100px]", "h-[100px]"],
        }),
        createElement("h4", {}, [this.props.username]),
        createElement("h4", { class: ["text-[var(--light-grey)]"] }, [
          this.props.xp + " pts",
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
