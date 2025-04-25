import {
  createElement,
  defineComponent,
  IComponent,
} from "../../../../../../../uccello/Uccello.js";

interface NotificationItemsProps {
  listItems: any[];
}

const NotificationItems = defineComponent<void, NotificationItemsProps>({
  state() {},
  render(this: IComponent<void, NotificationItemsProps>) {
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
      this.props.listItems.map((e) => {
        return createElement("div", { class: ["flex-row", "gap-[20px]"] }, [
          createElement("img", {
            src: e.avatar,
            class: ["w-[40px]", "rounded-full"],
          }),
          createElement("div", { class: ["mr-auto", "items-start"] }, [
            createElement("p", { class: ["text-[14px]"] }, [e.username]),
            e.sendRequest
              ? createElement(
                  "span",
                  { class: ["text-[var(--light-grey)]", "text-[10px]"] },
                  ["Send Request"]
                )
              : null,
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
      })
    );
  },
});

export default NotificationItems;
