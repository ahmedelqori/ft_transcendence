import Footer from "@/components/Footer/Footer";
import Header from "@/components/Header/Header";
import SideBar from "@/components/SideBar/SideBar";
import { router } from "@/router/Router";
import {
  createApp,
  createAuthState,
  createElement,
  defineComponent,
  eventBus,
  type IComponent,
  RouterOutlet,
} from "@/uccello/Uccello.js";
import { authState } from "@/Hooks/Auth";
import Toast from "@/components/Toast/Toast";
import notifSystem from "@/Hooks/Notif";

const ROOT = document.getElementById("root");

notifSystem;

interface AppState {
  isLoggedIn: boolean | null;
}

const App = defineComponent<AppState>({
  async onMounted(
    this: IComponent<AppState> & {
      checkIfUserIsLoggedIn: (any: void) => boolean;
    }
  ) {
    eventBus.on("auth:logout", () => {
      this.updateState({ isLoggedIn: false });
    });
    authState.subscribe((state) => {
      if (state.isAuthenticated && !this.state.isLoggedIn)
        this.updateState({ isLoggedIn: true });
      else if (!state.isAuthenticated && this.state.isLoggedIn) {
        this.updateState({ isLoggedIn: false });
      }
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
          "relative",
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
        this.state.isLoggedIn ? createElement(Toast) : null,
      ]
    );
  },
});

createApp(App, {}, { router }).mount(ROOT as HTMLElement);
