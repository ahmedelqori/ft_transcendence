import Footer from "./components/Footer/Footer.js";
import Header from "./components/Header/Header.js";
import SideBar from "./components/SideBar/SideBar.js";
import enhancedFetch from "./Hooks/fetch.js";
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
  isLoggedIn: boolean | null;
}

const App = defineComponent<AppState>({
  async onMounted(
    this: IComponent<AppState> & {
      checkIfUserIsLoggedIn: (any: void) => boolean;
    }
  ) {
    eventBus.on("auth:login", () => {
      this.updateState({ isLoggedIn: true });
    });

    eventBus.on("auth:logout", () => {
      this.updateState({ isLoggedIn: false });
    });
    eventBus.on("auth:loading", () => {
      this.updateState({ isLoggedIn: null });
    });
  },
  state() {
    return {
      isLoggedIn: null,
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
          "flex",
          "flex-col",
        ],
      },
      [
        this.state.isLoggedIn == null
          ? null
          : createElement(Header, { isLoggedIn: this.state.isLoggedIn }),
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
        this.state.isLoggedIn === false ? createElement(Footer) : null,
      ]
    );
  },
});

createApp(App, {}, { router }).mount(ROOT as HTMLElement);
