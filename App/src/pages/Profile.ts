import { router } from "@/router/Router.js";
import enhancedFetch from "@/Hooks/fetch.js";
import {
  createElement,
  defineComponent,
  eventBus,
  type IComponent,
} from "@/uccello/Uccello.js";
import ProfileInterface from "@/components/ProfileInterface/ProfileInterface.js";

interface ProfileState {
  whoami: string;
  username: string;
  isLoading: boolean;
}

const Profile = defineComponent<ProfileState>({
  async onMounted(
    this: IComponent<ProfileState> & {
      handleChangeParam: () => void;
      getUser: () => Promise<void>;
    }
  ) {
    document.title = "Profile";
    await this.getUser();
    window.addEventListener("hashchange", this.handleChangeParam);
    eventBus.on("change:profile", () => {
      if (this.getIsMounted) {
        this.updateState({ isLoading: true });
        this.updateState({
          username: (router.getParams as any).username!,
          isLoading: false,
        });
      }
    });
  },
  onUnMounted(
    this: IComponent<ProfileState> & { handleChangeParam: () => void }
  ) {
    window.removeEventListener("hashchange", this.handleChangeParam);
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
          ? ""
          : createElement(ProfileInterface, {
              username: this.state.username,
              whoami: this.state.whoami,
              class: [],
            }),
      ]
    );
  },
  handleChangeParam(
    this: IComponent<ProfileState> & { handleChangeParam: () => void }
  ) {
    if (router.getMatchedRoute?.path === "/profile/:username")
      eventBus.emit("change:profile");
  },
  async getUser(
    this: IComponent<ProfileState> & { handleChangeParam: () => void }
  ) {
    try {
      const res = await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/account/whoami/`
      );
      const data = await res.json();
      const username = (router.getParams as any).username;
      if (this.getIsMounted)
        this.updateState({ username, whoami: data.username, isLoading: false });
    } catch (err) {
      console.log(err);
    }
  },
});

export default Profile;
