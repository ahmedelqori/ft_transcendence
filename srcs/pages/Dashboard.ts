import { createElement, defineComponent } from "../uccello/Uccello.js";

const Dashboard = defineComponent<void>({
  state() {},
  render() {
    return createElement("div", {}, ["Dashboard Page"]);
  },
});

export default Dashboard;
