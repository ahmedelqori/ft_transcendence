import {
  createElement,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";
import NotificationItems from "./NotificationItems/NotificationItems.js";

interface NotificationsState {
  showNotification: boolean;
}

const Notifications = defineComponent<NotificationsState>({
  async onMounted(
    this: IComponent<NotificationsState> & {
      handleShowNotification: (e: MouseEvent) => void;
      handleClickOutSide: (e: MouseEvent) => void;
    }
  ) {
    this.handleClickOutSide = this.handleClickOutSide.bind(this);
    document.addEventListener("mousedown", this.handleClickOutSide);
  },

  onUnmounted(
    this: IComponent<NotificationsState> & {
      handleShowNotification: (e: MouseEvent) => void;
      handleClickOutSide: (e: MouseEvent) => void;
    }
  ) {
    document.removeEventListener("mousedown", this.handleClickOutSide);
  },

  state() {
    return {
      newNotification: null,
      showNotification: false,
    };
  },

  render(
    this: IComponent<NotificationsState> & {
      handleShowNotification: (e: MouseEvent) => void;
    }
  ) {
    return createElement(
      "div",
      {
        class: ["relative", "z-40"],
      },
      [
        createElement(
          "div",
          {
            class: ["p-2", "h-[40px]", "w-[40px]"],
            on: {
              click: this.handleShowNotification.bind(this),
            },
          },
          [
            createElement("i", {
              class: [
                "fa-solid",
                "fa-bell",
                "w-[20px]",
                "h-[24px]",
                "text-[1.5rem]",
                "text-[#878787]",
                "relative",
                // `after:content-["${
                //   this.state.notifications.length > 9
                //     ? "+9"
                //     : this.state.notifications.length
                // }"]`,
                // "after:absolute",
                // "after:w-fit",
                // "after:h-fit",
                // "after:p-2",
                // "after:rounded-full",
                // "after:right-[-22px]",
                // "after:top-[-18px]",
                // "after:text-[10px]",
                // "after:bg-[#ddf247]",
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
                  "top-[-12px]",
                  "right-[50px]",
                  "w-[310px]",
                  "h-fit",
                  "z-10",
                  "bg-[var(--background-color)]",
                  "rounded-t-[20px]",
                  "rounded-b-[10px]",
                  "px-[10px]",
                  "pt-[10px]",
                  "pb-[14px]",
                  "text-[12px]",
                  "text-center",
                  "align-center",
                  "justify-center",
                ],
              },
              [createElement(NotificationItems)]
            )
          : null,
      ]
    );
  },

  handleShowNotification(this: IComponent<NotificationsState>, e: MouseEvent) {
    this.updateState({
      showNotification: !this.state.showNotification,
    });
  },

  handleClickOutSide(this: IComponent<NotificationsState>, e: MouseEvent) {
    if (!this.state) {
      console.error("Component state is undefined");
      return;
    }
    if (this.state.showNotification) {
      const element = this.getHtmlElement;
      if (element && !element.contains(e.target as Node)) {
        this.updateState({
          showNotification: false,
        });
      }
    }
  },
});

export default Notifications;
