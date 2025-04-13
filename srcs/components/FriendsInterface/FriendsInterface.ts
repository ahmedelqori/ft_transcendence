import {
  createElement,
  IComponent,
  defineComponent,
} from "../../uccello/Uccello.js";
import FriendItem from "./FirendItem/FriendItem.js";

interface FriendsInterfaceState {
  friends: (string | null)[];
}

const FriendsInterface = defineComponent<FriendsInterfaceState>({
  onMounted(this: IComponent<FriendsInterfaceState>) {
    // setTimeout(() => {
    //   this.updateState({
    //     friends: [...this.state.friends, "baarif", "aes-arg", "mbentahi"],
    //   });
    // }, 3000);
  },
  state() {
    return {
      friends: [
        "sajaite",
        "ael-qori",
        "afanidi",
        "ybouchma",
        "relhamma",
        "zibnoukh",

        "baarif",
        "aes-arg",
        "mbentahi",
      ],
    };
  },
  render(this: IComponent<FriendsInterfaceState>) {
    return createElement(
      "section",
      {
        class: [
          "w-[90%]",
          "h-[720px]",
          "max-h-[720px]",
          "m-0",
          "p-0",
          "relative",
        ],
      },
      [
        createElement(
          "div",
          {
            class: [
              "w-full",
              "h-full",
              "max-h-[720px]",
              "grid",
              "grid-cols-3",
              "grid-rows-3",
              "w-full",
              "h-screen",
              "gap-4",
            ],
          },

          [
            ...this.state.friends.map((e) =>
              createElement(FriendItem, { username: e })
            ),
          ]
        ),
      ]
    );
  },
});

export default FriendsInterface;
