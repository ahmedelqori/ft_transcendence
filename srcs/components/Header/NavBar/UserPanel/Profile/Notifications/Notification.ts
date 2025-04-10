import {
  createElement,
  defineComponent,
  IComponent,
} from "../../../../../../uccello/Uccello.js";

interface NotificationsState {
  showNotification: boolean;
}

const Notifications = defineComponent<NotificationsState>({
  onMounted(this: IComponent<NotificationsState>) {},
  onUnmounted(this: IComponent<NotificationsState>) {},
  state() {
    return {
      showNotification: false,
    };
  },

  render(
    this: IComponent<NotificationsState> & {
      handleShowNotification: (e: HTMLElement) => void;
    }
  ) {
    return createElement(
      "div",
      {
        class: ["relative"],
      },
      [
        createElement(
          "div",
          {
            class: [
              "border-1",
              "border-[#878787]",
              "border",
              "rounded-full",
              "p-2",
              "h-[40px]",
              "w-[40px]",
            ],
            on: {
              click: this.handleShowNotification,
            },
          },
          [
            createElement("i", {
              class: [
                "fa-solid",
                "fa-bell",
                "text-[#878787]",
                "text-[1.5rem]",
                "w-[20px]",
                "h-[24px]",
              ],
            }),
          ]
        ),
        this.state.showNotification
          ? createElement(
              "div",
              {
                class: [
                  "absolute",
                  "bottom-[-80px]",
                  "right-[10px]",
                  "w-[260px]",
                  "h-[60px]",
                  "bg-black",
                  "rounded-[20px]",
                  "px-[10px]",
                  "py-[15px]",
                  "text-[12px]",
                  "text-center",
                ],
              },
              [
                "You’re all caught up! 🎉 There are no new notifications at the moment.",
              ]
            )
          : null,
      ]
    );
  },
  handleShowNotification(this: IComponent<NotificationsState>, e: HTMLElement) {
    this.updateState({
      showNotification: !this.state.showNotification,
    });
  },
});

export default Notifications;
