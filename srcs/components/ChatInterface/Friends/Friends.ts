import {
  createElement,
  defineComponent,
  IComponent,
} from "../../../uccello/Uccello.js";
import Friend from "./Friend/Friends.js";
import Search from "./Search/Search.js";

interface FriendsState {
  searchValue: string | null;
  friends: (string | null)[];
}

const Friends = defineComponent<FriendsState>({
  state() {
    return {
      searchValue: null,
      friends: ["sajaite", "ael-qori", "afanidi", "ybouchma"],
    };
  },
  render(this: IComponent<FriendsState>) {
    return createElement(
      "div",
      {
        class: ["w-[30%]", "h-full", "gap-4", "max-h-[750px]", "h-[750px]"],
      },
      [
        createElement(Search, {
          searchValue: this.state,
          onSearch: (input: string) => {
            this.updateState({ searchValue: input });
          },
        }),
        createElement(
          "div",
          {
            class: [
              "w-full",
              "px-1",
              "mb-auto",
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
          this.state.searchValue && this.state.searchValue.trim().length
            ? this.state.friends.map((e) => {
                if (e?.includes(this.state.searchValue?.trim()!))
                  return createElement(Friend, {
                    username: e,
                  });
                return null;
              })
            : this.state.friends.map((e) =>
                createElement(Friend, { username: e })
              )
        ),
      ]
    );
  },
});

export default Friends;
