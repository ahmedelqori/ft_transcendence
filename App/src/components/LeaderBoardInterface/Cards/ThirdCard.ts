import {
  createElement,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";

interface CardProps {
  id: number;
  xp: number;
  username: string;
  avatar: string;
}

const ThirdCard = defineComponent<void, CardProps>({
  render(this: IComponent<void, CardProps>) {
    return createElement(
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
          src: this.props.avatar,
          class: ["rounded-full", "w-[100px]", "h-[100px]"],
        }),
        createElement("h4", {}, [this.props.username]),
        createElement("h4", { class: ["text-[var(--light-grey)]"] }, [
          this.props.xp + " pts",
        ]),
        createElement("img", {
          class: ["absolute", "w-[50px]", "top-[90px]", "right-[15px]"],
          src: "assets/BronzeMedal.png",
        }),
      ]
    );
  },
});

export default ThirdCard;
