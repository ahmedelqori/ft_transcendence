import DashboardInterface from "@/components/DashboardInterface/DashboardInterface.js";
import { createElement, defineComponent } from "@/uccello/Uccello.js";

const Dashboard = defineComponent({
  onMounted() {
    document.title = "Dashboard";
  },
  state() {},
  render() {
    return createElement(
      "main",
      {
        class: [
          "flex",
          "w-full",
          "h-full",
          "flex-row",
          "my-auto",
          // "ml-8",
          "gap-[20px]",
          "items-start",
        ],
      },
      [createElement(DashboardInterface)]
    );
  },
});

export default Dashboard;
