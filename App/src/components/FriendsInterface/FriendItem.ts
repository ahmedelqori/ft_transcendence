import {
  createElement,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";

interface FriendItemProps {
  username: string;
}
interface FriendItemState {
  isLoading: boolean;
}

const FriendItem = defineComponent<FriendItemState, FriendItemProps>({
  onMounted(this: IComponent<FriendItemState, FriendItemProps>) {
    // Reduced loading time for better UX
    setTimeout(() => {
      this.updateState({ isLoading: false });
    }, 1500);
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
              "border-gray-300",
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
            ],
          },
          [
            createElement("div", {
              class: [
                "bg-gray-200",
                "dark:bg-gray-700",
                "rounded-full",
                "w-16",
                "h-16",
                "mb-4",
              ],
            }),
            createElement("div", {
              class: [
                "bg-gray-200",
                "dark:bg-gray-700",
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
              "border",
              "w-full",
              "h-full",
              "flex",
              "flex-col",
              "items-center",
              "justify-center",
              "border-2",
              "rounded-2xl",
              "border-gray-300",
              "dark:border-gray-700",
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
          },
          [
            createElement(
              "div",
              {
                class: ["w-full", "flex", "justify-center", "mb-3"],
              },
              [
                createElement("img", {
                  src: "assets/relhamma.png",
                  alt: this.props.username,
                  class: [
                    "rounded-full",
                    "w-16",
                    "h-16",
                    "object-cover",
                    "border-2",
                    "border-gray-100",
                    "dark:border-gray-800",
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
                  "px-2"
                ] 
              }, 
              [`@${this.props.username}`]
            ),
            createElement(
              "div",
              { class: ["absolute", "bottom-0", "right-0"] },
              [
                createElement(
                  "div",
                  {
                    class: ["relative", "w-10", "h-10"],
                  },
                  [
                    createElement("div", {
                      class: [
                        "cursor-pointer",
                        "absolute",
                        "top-0",
                        "left-0",
                        "h-0",
                        "w-0",
                        "rounded-tl-none",
                        "rounded-tr-none",
                        "rounded-bl-none",
                        "rounded-br-2xl",
                        "border-t-[40px]",
                        "border-r-[40px]",
                        "border-t-transparent",
                        "border-l-[#ddf247]",
                        "border-[#ddf247]",
                        "hover:border-[#c7da2c]",
                        "transition-colors",
                        "duration-200",
                      ],
                    }),
                    createElement(
                      "button",
                      {
                        class: [
                          "absolute",
                          "top-[65%]",
                          "left-[65%]",
                          "-translate-x-1/2",
                          "-translate-y-1/2",
                          "text-black",
                          "font-bold",
                          "text-lg",
                          "cursor-pointer",
                          "hover:scale-110",
                          "transition-transform",
                          "duration-200",
                        ],
                        "aria-label": "Remove friend",
                      },
                      ["-"]
                    ),
                  ]
                ),
              ]
            ),
          ]
        );
  },
});

export default FriendItem;