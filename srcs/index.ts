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
    // addEventListener("popstate", async (event) => {
    //   const path = await router.getMatchedRoute?.path;
    //   router.navigateTo(path);
    // });
    this.updateState({ isLoggedIn: this.checkIfUserIsLoggedIn() });

    eventBus.on("auth:login", () => {
      this.updateState({ isLoggedIn: true });
    });

    eventBus.on("auth:logout", () => {
      this.updateState({ isLoggedIn: false });
    });

    // router.onRouteChange((route) => {
    //   this.state.currentPath = route.path;
    // });
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
        createElement(Header),
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
            ...(this.state.isLoggedIn
              ? [createElement(SideBar)]
              : [
                  createElement(
                    "button",
                    {
                      on: {
                        click: () => router.navigateTo("/login"),
                      },
                    },
                    ["Go To Login"]
                  ),
                ]),
            createElement(RouterOutlet),
          ]
        ),
      ]
    );
  },
  checkIfUserIsLoggedIn() {
    return localStorage.getItem("user") !== null;
  },
});

createApp(App, {}, { router }).mount(ROOT as HTMLElement);

// render(this: IComponent<AppState>) {
//   return createElement(
//     "div",
//     {
//       class: ["h-full", "m-auto", "w-full", "max-w-7xl", "px-4", "flex", "flex-col", "gap-4"],
//     },
//     [
//       createElement(Header),
//       createElement(
//         "main",
//         {
//           class: ["flex", "w-full", "flex-1", "gap-4", "flex-col", "md:flex-row"]
//         },
//         [
//           createElement("aside", { class: ["w-full", "md:w-64", "shrink-0"] }, ["sidebar"]),
//           createElement("div", { class: ["flex-1", "min-w-0"] }, ["Dashboard"]),
//         ]
//       ),
//     ]
//   );
