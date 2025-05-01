import { router } from "../router/Router.js";
import {
  createFragment,
  defineComponent,
  createElement,
  eventBus,
} from "../uccello/Uccello.js";

const AccessToken = defineComponent({
  async onMounted() {
    try {
      const res = await fetch("https://64.23.191.17/api/account/set-cookie", {
        mode: "cors",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${(router.getParams as any).accessToken!}`,
        },
      });

      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      eventBus.emit("auth:loading");
      setTimeout(() => {
        router.navigateTo("/dashboard");
      }, 5000);
    } catch (err) {
      router.navigateTo("/login");
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
