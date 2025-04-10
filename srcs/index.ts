import Footer from "./components/Footer/Footer.js";
import Header from "./components/Header/Header.js";
import SideBar from "./components/SideBar/SideBar.js";
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
      [
        createElement(Header),
        createElement(
          "main",
          { class: ["h-full", "w-full", "container-grid"] },
          [
            createElement(SideBar, { class: ["containerd-grid-sidebar"] }),
            createElement(RouterOutlet, { class: ["containerd-grid-router"] }),
          ]
        ),
        createElement(Footer),
      ]
    );
  },
});

createApp(App, {}, { router }).mount(ROOT as HTMLElement);
