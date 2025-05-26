import { router } from "@/router/Router";
import {
  defineComponent,
  createElement,
  eventBus,
} from "../uccello/Uccello.js";
import enhancedFetch from "@/Hooks/fetch.js";
import { authState } from "@/Hooks/Auth.js";

const AccessToken = defineComponent({
  async onMounted() {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_URL_DEV}/api/account/set-cookie`,
        {
          mode: "cors",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${(router.getParams as any).accessToken!}`,
          },
        }
      );

      if (res.status === 401) throw "Unauthorized";
      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      const response = await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/account/whoami/`
      );
      let userdata = await response.json();
      authState.setState({
        isAuthenticated: true,
        user: {
          username: userdata.username,
          id: userdata.id,
          avatar: userdata.avatar_url,
          createdAt: userdata.created_at,
        },
      });
      await router.navigateTo("/dashboard");
    } catch (err) {
      await router.navigateTo("/login");
      authState.setState({
        isAuthenticated: false,
        user: null,
      });
      localStorage.clear();
    }
  },
  state() {},
  render() {
    return createElement(
      "div",
      {
        class: [
          "flex",
          "items-center",
          "justify-center",
          "h-full",
          "w-full",
          "bg-transparent",
        ],
      },
      [
        createElement("div", {
          class: [
            "animate-spin",
            "rounded-full",
            "h-16",
            "w-16",
            "border-4",
            "border-[var(--light-yellow)]",
            "border-t-transparent",
          ],
        }),
      ]
    );
  },
});

export default AccessToken;
