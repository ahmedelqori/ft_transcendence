import { createElement, defineComponent, eventBus } from "@/uccello/Uccello.js";
import { router } from "@/router/Router.js";
import enhancedFetch from "@/Hooks/fetch";
import Loader from "@/components/Loader/Loader";
const DOMAIN_GAME="http://localhost:3000"

const GameSetup = defineComponent<void>({
  async onMounted() {
    document.title = "Game Setup";
    eventBus.emit("navigate:bar", { data: "/game" });
    try {
      const res = await enhancedFetch.fetch(
        `${DOMAIN_GAME}/current_game`,
        {
          mode: "no-cors",
        }
      );
      const data = await res.json();
      console.log(data);
      if (res.status === 404) router.navigateTo("/dashboard");
      else router.navigateTo(`/game/${data.id}`);
    } catch (err) {}
  },

  state() {},

  render() {
    return createElement(
      "main",
      {
        class: [
          "flex",
          "flex-col",
          "w-full",
          "h-full",
          "items-center",
          "px-4",
          "py-2",
          "overflow-hidden",
        ],
      },
      [createElement(Loader)]
    );
  },
});

export default GameSetup;
