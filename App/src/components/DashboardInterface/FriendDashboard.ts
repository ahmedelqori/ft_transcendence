import { authState } from "@/Hooks/Auth";
import enhancedFetch from "@/Hooks/fetch";
import { createElement, defineComponent, IComponent } from "@/uccello/Uccello";

interface FriendDashboardState {
  friend: any;
  friends: any[];
  user: any;
}

const FriendDashboard = defineComponent<FriendDashboardState>({
  async onMounted(
    this: IComponent<FriendDashboardState> & {
      handleGetFriends: () => Promise<void>;
    }
  ) {
    await this.handleGetFriends();
  },
  state() {
    return { friend: null, friends: [], user: null };
  },
  render(
    this: IComponent<FriendDashboardState> & {
      getRandomFriend: () => Promise<void>;
    }
  ) {
    return createElement(
      "div",
      {
        style: {
          "clip-path": "polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)",
        },
        class: [
          "w-1/5",
          "h-full",
          "border-2",
          "border-[#878787]",
          "border-opacity-[30%]",
          "cursor-pointer",
          "py-8",
          "px-8",
          "relative",
          "bg-[linear-gradient(188deg,rgba(221,242,71,0.02)_0%,rgba(135,135,135,0.02)_100%)]",
          "hover:bg-[linear-gradient(188deg,rgba(221,242,71,0.10)_0%,rgba(135,135,135,0.10)_100%)]",
        ],
        on: {
          click: () => {
            this.getRandomFriend();
          },
        },
      },
      [
        createElement("i", {
          class: [
            "absolute",
            "ph",
            "ph-lightning",

            "text-[var(--light-grey)]",
            "opacity-[10%]",
            "text-[256px]",
            "top-1/2",
            "left-1/2",
            "-translate-y-1/2",
            "-translate-x-1/2",
            "z-[-20]",
          ],
        }),

        createElement(
          "p",
          {
            class: [
              "font-medium",
              "text-2xl",
              "relative",
              "after:absolute",
              "after:w-full",
              "after:h-[2px]",
              "after:left-[0px]",
              "after:bottom-[-4px]",
              "after:text-[10px]",
              "after:bg-[#ddf247]",
              "ml-auto",
              "z-30",
            ],
          },
          [
            this.state.user === null
              ? "Unknown".substring(0, 8)
              : this.state.user.username.substring(0, 8),
          ]
        ),
        createElement(
          "p",
          {
            class: [
              "text-9xl",
              "font-medium",
              "z-10",
              "text-[var(--light-yellow)]",
            ],
          },
          ["Vs"]
        ),
        createElement(
          "p",
          {
            class: [
              "font-medium",
              "text-2xl",
              "relative",
              "after:absolute",
              "after:w-full",
              "after:h-[2px]",
              "after:left-[0px]",
              "after:bottom-[-4px]",
              "after:text-[10px]",
              "after:bg-[#ddf247]",
              "mr-auto",
              "z-30",
            ],
          },
          [authState.getState().user?.username?.substring(0, 8)]
        ),
      ]
    );
  },
  async handleGetFriends(this: IComponent<FriendDashboardState>) {
    try {
      const res = await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/friends/`
      );
      const data = await res.json();
      setTimeout(() => {
        if (this.getIsMounted) {
          this.updateState({ friends: data });
        }
      }, 500);
    } catch (err) {
      console.log(err);
    }
  },
  async getRandomFriend(this: IComponent<FriendDashboardState>) {
    const user =
      this.state.friends[Math.floor(Math.random() * this.state.friends.length)];
    if (this.getIsMounted) {
      this.updateState({ user });
    }
    try {
      await enhancedFetch.fetch(`${import.meta.env.VITE_URL_DEV}/api/games/`, {
        method: "POST",
        body: JSON.stringify({ playerTwoId: this.state.user.id }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.log(err);
    }
  },
});

export default FriendDashboard;
