import { router } from "./router/Router.js";
import {
  createApp,
  createElement,
  defineComponent,
  RouterOutlet,
} from "./uccello/Uccello.js";

const ROOT = document.getElementById("root");

const App = defineComponent<void>({
  state() {},
  render() {
    return createElement("div", {}, [createElement(RouterOutlet)]);
  },
});

createApp(App, {}, { router }).mount(ROOT as HTMLElement);
