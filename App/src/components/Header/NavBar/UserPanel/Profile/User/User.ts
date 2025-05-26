import {
  createElement,
  defineComponent,
  eventBus,
  type IComponent,
} from "@/uccello/Uccello.js";
import { router } from "@/router/Router.js";

interface UserProps {
  isLoading: boolean;
  avatar: string | null;
  username: string | null;
}

interface UserState {}

const User = defineComponent<UserState, UserProps>({
  render(this: IComponent<UserState, UserProps>) {
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
        on: {
          click: async () => {
            await router.navigateTo(`/profile/${this.props.username}`);
            eventBus.emit("change:profile");
          },
        },
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
              loading: "lazy",
              class: ["w-full", "h-full", "rounded-full", "cursor-pointer"],
              src: this.props.avatar,
            }),
      ]
    );
  },
});

export default User;
