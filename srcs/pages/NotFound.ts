import { router } from "../router/Router.js";
import { createElement, defineComponent } from "../uccello/Uccello.js";

const NotFound = defineComponent<void>({
  onMounted() {
    document.title = "404 Not Found";
  },
  state() {},
  render() {
    console.log(router.getQuery);
    return createElement("div", {}, ["NotFound Page"]);
  },
});

export default NotFound;
