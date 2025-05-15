import { createElement, defineComponent, IComponent } from "@/uccello/Uccello";

interface FriendRequestNotifProps {
  username: string;
  avatar: string;
  id: number;
}

const FriendRequestNotif = defineComponent<void, FriendRequestNotifProps>({
  render(this: IComponent<void, FriendRequestNotifProps>) {
    return createElement("div", { class: ["flex-row", "gap-[20px]"] }, [
      createElement("img", {
        src: this.props.avatar,
        class: ["w-[40px]", "rounded-full"],
      }),
      createElement("div", { class: ["mr-auto", "items-start"] }, [
        createElement("p", { class: ["text-[14px]"] }, [this.props.username]),
        createElement(
          "span",
          { class: ["text-[var(--light-grey)]", "text-[10px]"] },
          ["Send Request"]
        ),
      ]),
      createElement("div", { class: ["flex-row", "gap-2"] }, [
        createElement(
          "button",
          {
            class: [
              "rounded-[16px]",
              "bg-[var(--light-yellow)]",
              "text-[var(--dark-black)]",
              "px-2",
              "py-1",
              "text-[10px]",
              "font-medium",
              "hover:scale-[104%]",
            ],
          },
          ["Accept"]
        ),
        createElement(
          "button",
          {
            class: [
              "rounded-[16px]",
              "bg-[var(--red-color)]",
              "text-[var(--dark-black)]",
              "text-[10px]",
              "px-2",
              "py-1",
              "font-medium",
              "hover:scale-[104%]",
            ],
          },
          ["Decline"]
        ),
      ]),
    ]);
  },
});

export default FriendRequestNotif;
