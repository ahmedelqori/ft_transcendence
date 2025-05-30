import { createElement, defineComponent, IComponent } from "@/uccello/Uccello";
import FriendsSideBar from "./FriendsSideBar";
import Loader from "../Loader/Loader";
import enhancedFetch from "@/Hooks/fetch";

interface SideBarDashboardState {
  friends: [];
  showFriend: boolean;
  loadingFriends: boolean;
}

const SideBarDashboard = defineComponent<SideBarDashboardState>({
  async onMounted(
    this: IComponent<SideBarDashboardState> & {
      handleGetFriends: () => Promise<void>;
    }
  ) {
    await this.handleGetFriends();
  },
  state() {
    return {
      friends: [],
      showFriend: false,
      loadingFriends: true,
    };
  },
  render(
    this: IComponent<SideBarDashboardState> & {
      sendInvite: () => Promise<void>;
    }
  ) {
    return createElement(
      "div",
      {
        class: [
          this.state.showFriend ? "w-[35%]" : "w-[150px]",
          "border-2",
          "border-opacity-[30%]",
          "h-fit",
          "max-h-full",
          "rounded-[30px]",
          "border-[#878787]",
          "border-opacity-[30%]",
          "py-8",
          "px-6",
          "transition-all",
          "duration-[1s]",
          "ease-in-out",
        ],
        on: {
          mouseenter: (e) => {
            this.updateState({ showFriend: true });
          },
          mouseleave: (e) => {
            this.updateState({ showFriend: false });
          },
        },
      },
      [
        createElement(
          "div",
          {
            class: [
              "w-full",
              "h-full",
              this.state.showFriend ? "items-start" : "items-center",
              "gap-4",
              "overflow-y-auto",
              "overflow-x-hidden",
              "[&::-webkit-scrollbar]:hidden",
              "[-ms-overflow-style:none]",
              "[scrollbar-width:none]",
            ],
          },
          this.state.loadingFriends
            ? [createElement(Loader)]
            : this.state.friends.map((e: any) =>
                createElement(FriendsSideBar, {
                  id: e.id,
                  avatar: e.avatar_url,
                  username: e.username,
                  showFriend: this.state.showFriend,
                  firstname: e.first_name,
                  lastname: e.last_name,
                })
              )
        ),
      ]
    );
  },
  async handleGetFriends(this: IComponent<SideBarDashboardState>) {
    try {
      const res = await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/friends/`
      );
      const data = await res.json();
      setTimeout(() => {
        if (this.getIsMounted)
          this.updateState({ friends: data, loadingFriends: false });
      }, 500);
    } catch (err) {
      console.log(err);
    }
  },
});

export default SideBarDashboard;
