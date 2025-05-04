import User from "./User/User.js";
import Notifications from "./Notifications/Notification.js";
import {
  createElement,
  IComponent,
  defineComponent,
  eventBus,
} from "../../../../../uccello/Uccello.js";
import enhancedFetch from "../../../../../Hooks/fetch.js";
import { router } from "../../../../../router/Router.js";

interface ProfileState {
  username: string | null;
  avatar: string | null;
  isLoading: boolean;
}

const Profile = defineComponent<ProfileState>({
  async onMounted(
    this: IComponent<ProfileState> & { loadAvatar: () => Promise<void> }
  ) {
    eventBus.on("load:avatar", (data: any) => {
      this.updateState({ isLoading: true });

      this.updateState({ avatar: data.avatar, isLoading: false });
    });
    await this.loadAvatar();
  },
  state() {
    return {
      username: null,
      avatar: null,
      isLoading: true,
    };
  },
  render(this: IComponent<ProfileState>) {
    return createElement(
      "div",
      {
        class: ["flex", "flex-row", "gap-6"],
        on: {
          click: () => {
            router.navigateTo(`/profile/${this.state.username}`);
          },
        },
      },
      [
        createElement(Notifications),
        createElement(User, {
          avatar: this.state.avatar,
          isLoading: this.state.isLoading,
        }),
        this.state.isLoading
          ? createElement(
              "div",
              {
                class: [
                  "hidden",
                  "lg:block",
                  "bg-gray-300",
                  "rounded",
                  "animate-pulse",
                ],
              },
              [this.state.username]
            )
          : createElement("p", { class: ["hidden", "text-xl", "lg:block"] }, [
              this.state.username,
            ]),
      ]
    );
  },
  async loadAvatar(this: IComponent<ProfileState>) {
    try {
      const response = await enhancedFetch.fetch(
        "https://64.23.191.17/api/account/whoami/"
      );
      const data = await response.json();
      this.updateState({
        avatar: data.avatar_url,
        isLoading: false,
        username: data.username,
      });
    } catch (err) {
      console.log(err);
    }
  },
});

export default Profile;
