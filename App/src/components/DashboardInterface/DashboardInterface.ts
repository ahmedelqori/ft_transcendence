import enhancedFetch from "@/Hooks/fetch";
import {
  createElement,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";

interface IDashboardInterface {}

const DashboardInterface = defineComponent<IDashboardInterface>({
  state() {
    return {};
  },

  render(
    this: IComponent<IDashboardInterface> & { sendInvite: () => Promise<void> }
  ) {
    return createElement(
      "section",
      {
        class: [
          "z-10",
          "mt-10",
          "w-full",
          "flex",
          "items-start",
          "justify-start",
        ],
      },
      []
    );
  },

  async sendInvite(this: IComponent<IDashboardInterface>) {
    // await enhancedFetch.fetch(
    //   `https://www.meedivo.me/api/friends/${this.state.value}/request`,
    //   {
    //     method: "POST",
    //   }
    // );
  },
});

export default DashboardInterface;
