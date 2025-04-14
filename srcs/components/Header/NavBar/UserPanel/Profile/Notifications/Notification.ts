import {
  createElement,
  defineComponent,
  IComponent,
} from "../../../../../../uccello/Uccello.js";
import NotificationItems from "./NotificationItems/NotificationItems.js";

interface NotificationsState {
  showNotification: boolean;
  notifications: any[];
}

const Notifications = defineComponent<NotificationsState>({
  async onMounted(
    this: IComponent<NotificationsState> & {
      handleShowNotification: (e: MouseEvent) => void;
      handleClickOutSide: (e: MouseEvent) => void;
    }
  ) {
    // const socket = new WebSocket("ws://localhost:3001");
    this.handleClickOutSide = this.handleClickOutSide.bind(this);
    document.addEventListener("mousedown", this.handleClickOutSide);
    // socket.addEventListener("message", ({ data }) => {
    //   this.updateState({ notifications: [...this.state.notifications, data] });
    // });
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
      showNotification: true,
      notifications: [
        {
          avatar: "../../../../../../../../public/assets/afanidi.png",
          username: "afanidi",
          sendRequest: true,
        },
        {
          avatar: "../../../../../../../../public/assets/afanidi.png",
          username: "afanidi",
          sendRequest: true,
        },
        {
          avatar: "../../../../../../../../public/assets/afanidi.png",
          username: "afanidi",
          sendRequest: true,
        },
        {
          avatar: "../../../../../../../../public/assets/afanidi.png",
          username: "afanidi",
          sendRequest: true,
        },
        {
          avatar: "../../../../../../../../public/assets/afanidi.png",
          username: "afanidi",
          sendRequest: true,
        },
        {
          avatar: "../../../../../../../../public/assets/afanidi.png",
          username: "afanidi",
          sendRequest: true,
        },
        {
          avatar: "../../../../../../../../public/assets/afanidi.png",
          username: "afanidi",
          sendRequest: true,
        },
        {
          avatar: "../../../../../../../../public/assets/afanidi.png",
          username: "afanidi",
          sendRequest: true,
        },
        {
          avatar: "../../../../../../../../public/assets/afanidi.png",
          username: "afanidi",
          sendRequest: true,
        },
        {
          avatar: "../../../../../../../../public/assets/afanidi.png",
          username: "afanidi",
          sendRequest: true,
        },
        {
          avatar: "../../../../../../../../public/assets/afanidi.png",
          username: "afanidi",
          sendRequest: true,
        },
        {
          avatar: "../../../../../../../../public/assets/afanidi.png",
          username: "afanidi",
          sendRequest: true,
        },
      ],
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
            class: [
              "p-2",
              "border",
              "h-[40px]",
              "w-[40px]",
              "border-1",
              "rounded-full",
              "border-[#878787]",
            ],
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
                `after:content-["${
                  this.state.notifications.length > 9
                    ? "+9"
                    : this.state.notifications.length
                }"]`,
                "after:absolute",
                "after:w-fit",
                "after:h-fit",
                "after:p-2",
                "after:rounded-full",
                "after:right-[-22px]",
                "after:top-[-18px]",
                "after:text-[10px]",
                "after:bg-[#ddf247]",
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
                  "bg-transparent",
                  // "bg-[var(--background-color)]",
                  "rounded-[20px]",
                  "px-[10px]",
                  "py-[15px]",
                  "text-[12px]",
                  "text-center",
                  "align-center",
                  "justify-center",
                ],
              },
              [
                !this.state.notifications.length
                  ? "You're all caught up! 🎉 There are no new notifications at the moment."
                  : createElement(NotificationItems, {
                      listItems: this.state.notifications,
                    }),
              ]
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
