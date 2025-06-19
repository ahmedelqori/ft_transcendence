import {
  createElement,
  createFragment,
  defineComponent,
  eventBus,
  type IComponent,
} from "@/uccello/Uccello.js";
import FriendRequestNotif from "./FriendRequestNotif";
import enhancedFetch from "@/Hooks/fetch";

interface NotificationItemsState {
  Notifications: any[];
}

const NotificationItems = defineComponent<NotificationItemsState>({
  async onMounted(this: IComponent<NotificationItemsState>) {
    try {
      const res = await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/notif/`
      );
      const data = await res.json();
      console.log(data.result);
      if (this.getIsMounted) this.updateState({ Notifications: data.result });
    } catch (err) {}
    eventBus.on("add:notif", (data: any) => {
      if (this.getIsMounted)
        this.updateState({
          Notifications: [...this.state.Notifications, { data }],
        });
    });
  },
  state() {
    return { Notifications: [] };
  },
  render(this: IComponent<NotificationItemsState>) {
    return createElement(
      "div",
      {
        class: [
          "gap-4",
          "z-40",
          "pt-[12px]",
          "pr-[4px]",
          "max-h-[160px]",
          "overflow-scroll",
          "overflow-x-hidden",
          "[&::-webkit-scrollbar]:w-1",
          "[&::-webkit-scrollbar-track]:rounded-full",
          "[&::-webkit-scrollbar-track]:bg-gray-100",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "[&::-webkit-scrollbar-thumb]:bg-gray-300",
          "dark:[&::-webkit-scrollbar-track]:bg-transparent",
          "dark:[&::-webkit-scrollbar-thumb]:bg-[#ddf247]",
          "dark:[&::-webkit-scrollbar-thumb]:bg-opacity-[70%]",
        ],
      },
      !this.state.Notifications.length
        ? [
            createElement("div", {}, [
              "You’re all caught up! 🎉 There are no new notifications at the moment.",
            ]),
          ]
        : this.state.Notifications.map((e: any) => {
            const info = e;
            switch (info.type) {
              case "friendRequest":
                return createElement(FriendRequestNotif, {
                  username: info.Sender.username.substring(0, 10),
                  id: info.Sender.id,
                  avatar: info.Sender.avatar_url,
                  notifId: info.id,
                  deleteNotif: (id: number) => {
                    this.updateState({
                      Notifications: this.state.Notifications.filter(
                        (e) => e.id != id
                      ),
                    });
                  },
                });
            }
          })
    );
  },
});

export default NotificationItems;
