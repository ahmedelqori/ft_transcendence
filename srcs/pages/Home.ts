import { createElement, defineComponent } from "../uccello/Uccello.js";

const Home = defineComponent<void>({
  state() {},
  render() {
    return createElement("main", {}, ["Home Page"]);
  },
});

export default Home;
