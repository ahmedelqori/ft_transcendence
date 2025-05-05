import { router } from "@/router/Router.js";
import enhancedFetch from "@/Hooks/fetch.js";
import {
  createElement,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";
import ProfileInterface from "@/components/ProfileInterface/ProfileInterface.js";

interface ProfileState {
  whoami: string;
  username: string;
  isLoading: boolean;
}

const Profile = defineComponent<ProfileState>({
  async onMounted(this: IComponent<ProfileState>) {
    document.title = "Profile";
    try {
      const res = await enhancedFetch.fetch(
        "https://64.23.191.17/api/account/whoami/"
      );
      const data = await res.json();
      const username = (router.getParams as any).username;
      this.updateState({ username, whoami: data.username, isLoading: false });
    } catch (err) {
      console.log(err);
    }
  },
  state() {
    return { whoami: "", username: "", isLoading: true };
  },
  render(this: IComponent<ProfileState>) {
    return createElement(
      "main",
      {
        class: ["flex", "w-full", "gap-[20px]", "mt-[10%]", "z-10"],
      },
      [
        this.state.isLoading
          ? null
          : createElement(ProfileInterface, {
              username: this.state.username,
              whoami: this.state.whoami,
              class: [],
            }),
      ]
    );
  },
});

export default Profile;
