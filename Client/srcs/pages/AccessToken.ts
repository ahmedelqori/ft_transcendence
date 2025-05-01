import { router } from "../router/Router.js";
import {
  createFragment,
  defineComponent,
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
      router.navigateTo("/dashboard");
    } catch (err) {
      router.navigateTo("/dashboard");
    }
  },
  state() {},
  render() {
    return createFragment(["Is Loading"]);
  },
});

export default AccessToken;
