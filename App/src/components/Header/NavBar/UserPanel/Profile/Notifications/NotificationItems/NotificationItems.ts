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
      // const res = await enhancedFetch.fetch(
      //   "https://www.meedivo.me/api/notif/"
      // );
      // const data = await res.json();
      // this.updateState({ Notifications: data.result });
      // console.log(data);
    } catch (err) {}
    eventBus.on("add:notif", (data: any) => {
      console.log(this.state.Notifications);
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
            console.log(e);
            const info = e.data;
            switch (info.type) {
              case "friendRequest":
                return createElement(FriendRequestNotif, {
                  username: info.data.username,
                  id: info.data.id,
                  avatar: info.data.avatar,
                });
            }
            return createFragment([]);
          })
    );
  },
});

export default NotificationItems;
