import {
  createElement,
  defineComponent,
  IComponent,
} from "../../../../../../uccello/Uccello.js";

interface UserProps {
  isLoading: boolean;
  avatar: string | null;
}

const User = defineComponent<void, UserProps>({
  render(this: IComponent<void, UserProps>) {
    return createElement(
      "div",
      {
        class: [
          "w-[60px]",
          "h-[60px]",
          "max-md:w-[46px]",
          "max-md:h-[46px]",
          "rounded-full",
          "flex",
          "items-center",
          "justify-center",
          "z-10",
        ],
      },
      [
        this.props.isLoading
          ? createElement("div", {
              class: [
                "w-full",
                "h-full",
                "rounded-full",
                "bg-gray-300",
                "animate-pulse",
              ],
            })
          : createElement("img", {
              class: ["w-full", "h-full", "rounded-full", "cursor-pointer"],
              src: this.props.avatar,
            }),
      ]
    );
  },
});

export default User;
