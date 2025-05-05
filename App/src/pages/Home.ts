import { createElement, defineComponent } from "@/uccello/Uccello.js";

const Home = defineComponent<void>({
  onMounted() {
    document.title = "OpeN9";
  },
  state() {},
  render() {
    return createElement("main", {}, ["Home Page"]);
  },
});

export default Home;
