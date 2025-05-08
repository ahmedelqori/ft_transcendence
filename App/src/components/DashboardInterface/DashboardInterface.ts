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

  render() {
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
      ["Dashboard"]
    );
  },
});

export default DashboardInterface;
