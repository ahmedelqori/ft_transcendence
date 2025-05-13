import {
  createElement,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";
import Friend from "./Friend.js";
import Search from "./Search.js";
import enhancedFetch from "@/Hooks/fetch.js";
import { authState } from "@/Hooks/Auth.js";

interface UserInterface {
  username: string;
  id: string;
  avatar: any;
}

interface FriendsState {
  searchValue: string | null;
  friends: UserInterface[];
  selectedUser: string | null;
  option: string | null;
}

interface FriendsProps {
  setShowSelectedUser: (user: string) => void;
  setUserId: (id: number) => void;
  receiverId: number;
}

const Friends = defineComponent<FriendsState, FriendsProps>({
  async onMounted(this: IComponent<FriendsState, FriendsProps>) {
    try {
      const response = await enhancedFetch.fetch(
        "https://www.meedivo.me/api/friends/"
      );
      const data = await response.json();

      let users: UserInterface[] = data.map((user: any) => {
        return {
          username: user.username,
          id: user.id,
          avatar: user.avatar_url,
        };
      });
      const currentUser = authState.getState().user?.username;
      users = users.filter((e) => e.username !== currentUser);
      this.updateState({ friends: users });
    } catch (err) {}
  },
  state() {
    return {
      searchValue: null,
      friends: [],
      selectedUser: null,
      option: null,
    };
  },
  render(this: IComponent<FriendsState, FriendsProps>) {
    if (this.state.option && this.state.selectedUser) {
      if (this.state.option == "unfriend") {
        const newFriends = this.state.friends.filter(
          (e) => e.username != this.state.selectedUser
        );
        this.updateState({
          friends: newFriends,
          option: null,
          selectedUser: null,
        });
        this.props.setShowSelectedUser("");
        this.props.setUserId(-1);
      } else if (this.state.option == "block") {
        const newFriends = this.state.friends.filter(
          (e) => e.username != this.state.selectedUser
        );
        this.updateState({
          friends: newFriends,
          option: null,
          selectedUser: null,
        });
        this.props.setShowSelectedUser("");
        this.props.setUserId(-1);
      } else {
        this.updateState({
          option: null,
          selectedUser: null,
        });
      }
    }
    return createElement(
      "div",
      {
        class: [
          "lg:w-[40%]",
          "max-lg:flex-1",
          "min-h-auto",
          "h-[70vh]",
          "max-md:h-[66vh]",
          "xl:w-[30%]",
          "h-full",
          "gap-4",
          "flex",
          "flex-col",
          "max-lg:gap-1",
        ],
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
              "pr-4",
              "px-1",
              "mb-auto",
              "gap-3",
              "flex-1",
              "flex",
              "flex-col",
              "max-lg:gap-1",
              "justify-start",
              "overflow-y-auto",
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
            ? this.state.friends.map((e: UserInterface) => {
                if (e.username.includes(this.state.searchValue?.trim()!))
                  return createElement(Friend, {
                    username: e.username,
                    avatar: e.avatar,
                    id: e.id,
                    setOption: (input: string) => {
                      this.updateState({ option: input });
                    },
                    setUser: (input: string) => {
                      this.updateState({ selectedUser: input });
                    },
                    setSelectedFriend: (username: string) => {
                      this.props.setShowSelectedUser(username);
                    },
                    setFriendUserId: (id: number) => {
                      this.props.setUserId(id);
                    },
                  });
                return null;
              })
            : this.state.friends.map((e) =>
                createElement(Friend, {
                  username: e.username,
                  id: e.id,
                  avatar: e.avatar,
                  setOption: (input: string) => {
                    this.updateState({ option: input });
                  },
                  setUser: (input: string) => {
                    this.updateState({ selectedUser: input });
                  },
                  setSelectedFriend: (username: string) => {
                    this.props.setShowSelectedUser(username);
                  },
                  setFriendUserId: (id: number) => {
                    this.props.setUserId(id);
                  },
                })
              )
        ),
      ]
    );
  },
});

export default Friends;
