import { createElement, defineComponent } from "../uccello/Uccello.js";

const Dashboard = defineComponent<void>({
  onMounted() {
    document.title = "Dashboard";
  },
  state() {},
  render() {
    return createElement("main", {}, [, "Dashboard Page"]);
  },
});

export default Dashboard;
