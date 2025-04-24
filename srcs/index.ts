import Footer from "./components/Footer/Footer.js";
import Header from "./components/Header/Header.js";
import SideBar from "./components/SideBar/SideBar.js";
import { router } from "./router/Router.js";
import {
  createApp,
  createElement,
  defineComponent,
  eventBus,
  IComponent,
  RouterOutlet,
} from "./uccello/Uccello.js";

const ROOT = document.getElementById("root");

interface AppState {
  currentPath: string;
  canShowSideBar: boolean;
  isLoggedIn: boolean;
}

const App = defineComponent<AppState>({
  async onMounted(
    this: IComponent<AppState> & {
      checkIfUserIsLoggedIn: (any: void) => boolean;
    }
  ) {
    this.updateState({ isLoggedIn: this.checkIfUserIsLoggedIn() });

    eventBus.on("auth:login", () => {
      this.updateState({ isLoggedIn: true });
    });

    eventBus.on("auth:logout", () => {
      this.updateState({ isLoggedIn: false });
    });
  },
  state() {
    return {
      currentPath: router.getMatchedRoute?.path,
      canShowSideBar: true,
      isLoggedIn: true,
    };
  },
  render(this: IComponent<AppState>) {
    return createElement(
      "div",
      {
        class: [
          "h-screen",
          "m-auto",
          "w-[95%]",
          "justify-start",
          "gap-4",
          "max-lg:gap-6",
        ],
      },
      [
        createElement(Header, { isLoggedIn: this.state.isLoggedIn }),
        createElement(
          "main",
          {
            class: [
              "flex",
              "w-full",
              "flex-1",
              "gap-16",
              "flex-col",
              "h-screen",
              "lg:flex-row",
              "max-lg:gap-4",
              "max-lg:flex-col",
              "max-lg:flex-col-reverse",
            ],
          },
          [
            ...(this.state.isLoggedIn ? [createElement(SideBar)] : [null]),
            createElement(RouterOutlet),
          ]
        ),
        createElement(Footer),
      ]
    );
  },
  checkIfUserIsLoggedIn() {
    return localStorage.getItem("user") !== null;
  },
});

createApp(App, {}, { router }).mount(ROOT as HTMLElement);
