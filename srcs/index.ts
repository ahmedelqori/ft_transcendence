import Header from "./components/Header/Header.js";
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
    return createElement(
      "div",
      {
        class: ["h-[90%]", "m-auto", "w-[95%]"],
      },
      [createElement(Header), createElement(RouterOutlet)]
    );
  },
});

createApp(App, {}, { router }).mount(ROOT as HTMLElement);
