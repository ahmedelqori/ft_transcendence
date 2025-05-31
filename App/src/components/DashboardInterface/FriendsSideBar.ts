import enhancedFetch from "@/Hooks/fetch";
import { router } from "@/router/Router";
import {
  createElement,
  createFragment,
  defineComponent,
  IComponent,
} from "@/uccello/Uccello";

interface FriendsSideBarProps {
  id: number;
  avatar: string;
  username: string;
  lastname: string;
  firstname: string;
  showFriend: boolean;
}

const FriendsSideBar = defineComponent<void, FriendsSideBarProps>({
  render(
    this: IComponent<void, FriendsSideBarProps> & {
      handlePlayButton: () => Promise<void>;
    }
  ) {
    return createElement("div", { class: ["mb-auto", "w-full"] }, [
      createElement("div", { class: ["flex-row", "gap-5", "w-full"] }, [
        createElement("img", {
          src: this.props.avatar,
          class: ["w-[75px]", "rounded-full"],
          on: {
            click: async () =>
              await router.navigateTo(`/profile/${this.props.username}`),
          },
        }),
        this.props.showFriend
          ? createFragment([
              createElement(
                "div",
                {
                  class: ["items-start", "w-full", "min-w-[200px]"],
                },
                [
                  createElement("p", {}, [
                    `${this.props.firstname} ${this.props.lastname}`,
                  ]),
                  createElement(
                    "span",
                    { class: ["text-[var(--light-grey)]"] },
                    [`@${this.props.username}`]
                  ),
                ]
              ),
              createElement(
                "button",
                {
                  on: {
                    click: async () => await this.handlePlayButton(),
                  },
                  class: [
                    "flex-1",
                    "rounded-2xl",
                    "bg-[var(--light-yellow)]",
                    "text-[var(--dark-black)]",
                    "font-medium",
                    "px-10",
                    "py-2",
                    "gap-2",
                    "ml-auto",
                    "text-lg",
                    "text-center",
                  ],
                },
                ["Play"]
              ),
            ])
          : null,
      ]),
    ]);
  },
  async handlePlayButton(this: IComponent<void, FriendsSideBarProps>) {
    try {
      await enhancedFetch.fetch(`${import.meta.env.VITE_URL_DEV}/api/games/`, {
        method: "POST",
        body: JSON.stringify({ playerTwoId: this.props.id }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.log(err);
    }
  },
});

export default FriendsSideBar;
