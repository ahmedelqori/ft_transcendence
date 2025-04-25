import Footer from "./components/Footer/Footer.js";
import Header from "./components/Header/Header.js";
import SideBar from "./components/SideBar/SideBar.js";
import { router } from "./router/Router.js";
import {
  createApp,
  createElement,
  defineComponent,
  RouterOutlet,
  IComponent,
} from "./uccello/Uccello.js";

const ROOT = document.getElementById("root");

interface AppState {
  currentPath: string;
  canShowSideBar: boolean;
}

const App = defineComponent<AppState>({
  async onMounted(this: IComponent<AppState>) {
    addEventListener("popstate", async (event) => {
      const path = await router.getMatchedRoute?.path;
      if (path == "/")
        this.updateState({ currentPath: path, canShowSideBar: false });
      else this.updateState({ currentPath: path, canShowSideBar: true });
    });
  },
  state() {
    return {
      currentPath: router.getMatchedRoute?.path,
      canShowSideBar: true,
    };
  },
  render(this: IComponent<AppState>) {
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
            this.state.canShowSideBar
              ? createElement(SideBar, { class: ["containerd-grid-sidebar"] })
              : null,
            createElement(RouterOutlet, { class: ["containerd-grid-router"] }),
          ]
        ),
        createElement(Footer),
      ]
    );
  },
});

createApp(App, {}, { router }).mount(ROOT as HTMLElement);
