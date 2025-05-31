import { router } from "@/router/Router";
import {
  createElement,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";

interface FriendItemProps {
  username: string;
  avatar: string;
  id: number;
}
interface FriendItemState {
  isLoading: boolean;
}

const FriendItem = defineComponent<FriendItemState, FriendItemProps>({
  onMounted(this: IComponent<FriendItemState, FriendItemProps>) {
    if (this.getIsMounted) this.updateState({ isLoading: false });
  },
  state() {
    return { isLoading: true };
  },
  render(this: IComponent<FriendItemState, FriendItemProps>) {
    return this.state.isLoading
      ? createElement(
          "div",
          {
            class: [
              "border",
              "w-full",
              "h-full",
              "border-2",
              "rounded-2xl",
              "border-[#878787]",
              "border-opacity-30",
              "animate-pulse",
              "flex",
              "flex-col",
              "items-center",
              "justify-center",
              "p-4",
              "shadow-sm",
              "transition-all",
              "duration-300",
              "cursor-pointer",
            ],
          },
          [
            createElement("div", {
              class: [
                "bg-[#878787]",
                "bg-opacity-30",
                "rounded-full",
                "w-16",
                "h-16",
                "mb-4",
              ],
            }),
            createElement("div", {
              class: [
                "bg-[#878787]",
                "bg-opacity-30",
                "rounded-md",
                "h-4",
                "w-3/4",
              ],
            }),
          ]
        )
      : createElement(
          "div",
          {
            class: [
              "cursor-pointer",
              "border",
              "w-full",
              "h-full",
              "flex",
              "flex-col",
              "items-center",
              "justify-center",
              "border-2",
              "rounded-2xl",
              "border-[#878787]",
              "border-opacity-30",
              "relative",
              "py-6",
              "px-4",
              "shadow-sm",
              "hover:shadow-md",
              "transition-all",
              "duration-300",
              "hover:border-opacity-50",
            ],
            on: {
              click: async () =>
                await router.navigateTo(`/profile/${this.props.username}`),
            },
          },
          [
            createElement(
              "div",
              {
                class: ["w-full", "flex", "justify-center", "mb-3"],
              },
              [
                createElement("img", {
                  src: this.props.avatar,
                  alt: this.props.username,
                  class: [
                    "rounded-full",
                    "w-20",
                    "h-20",
                    "object-cover",
                    "border-2",
                    "border-[#878787]",
                    "hover:scale-110",
                    "transition-transform",
                    "duration-200",
                  ],
                }),
              ]
            ),
            createElement(
              "div",
              {
                class: [
                  "w-full",
                  "text-center",
                  "font-medium",
                  "text-gray-800",
                  "dark:text-gray-200",
                  "truncate",
                  "px-2",
                ],
              },
              [`@${this.props.username}`]
            ),
          ]
        );
  },
});

export default FriendItem;
