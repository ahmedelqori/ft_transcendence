import { router } from "../../../router/Router.js";
import {
  createElement,
  defineComponent,
  RouterLink,
  IComponent,
  ELEMENT_INTER,
} from "../../../uccello/Uccello.js";

interface NavigationBarState {
  routes: string[];
  icons: string[];
  current: string;
}
interface NavigationItem {
  path: string;
  current: string;
  icon: string;
}
const NavigationItem = defineComponent<void, NavigationItem>({
  state() {},

  render(
    this: IComponent<void, NavigationItem> & {
      path: string;
      current: string;
      icons: string;
    }
  ) {
    return createElement(RouterLink, { to: this.props?.path }, [
      createElement(
        "div",
        {
          class: [
            "flex",
            "flex-row",
            "justify-between",
            "gap-3",
            "text-[var(--light-grey)]",
            "hover:text-[var(--light-yellow)]",
            "transition-all",
            "duration-300",
            "hover:shadow-lg",
            "hover:scale-105",
          ],
        },
        [
          createElement("i", {
            class: ["ph", this.props.icon, "text-3xl"],
          }),
          createElement("div", { class: ["hidden", "lg:block"] }, [
            String(this.props.path).charAt(1).toUpperCase() +
              String(this.props.path).slice(2),
          ]),
        ]
      ),
    ]);
  },
});

const NavigationBar = defineComponent<NavigationBarState>({
  state(): NavigationBarState {
    return {
      routes: [
        "/dashboard",
        "/game",
        "/chat",
        "/tournament",
        "/leaderboard",
        "/settings",
      ],
      icons: [
        "ph-house-simple",
        "ph-ping-pong",
        "ph-chats",
        "ph-trophy",
        "ph-ranking",
        "ph-gear",
      ],
      current: router.getMatchedRoute?.path || "/",
    };
  },
  render(
    this: IComponent<NavigationBarState> & { createList: () => ELEMENT_INTER[] }
  ) {
    return createElement(
      "div",
      {
        class: [
          "flex",
          "flex-col",
          "gap-4",
          "text-[#878787]",
          "text-xl",
          "max-md:ml-0",
          "max-md:gap-8",
          "h-[65%]",
          "justify-around",
          "max-lg:flex-row",
          "items-start",
          "max-lg:w-full",
        ],
      },
      [
        ...this.createList(),
        createElement(
          "div",
          {
            class: [
              "flex",
              "flex-row",
              "gap-3",
              "cursor-pointer",
              "text-[var(--light-grey)]",
              "hover:text-[var(--light-yellow)]",
              "max-sm:hidden",
            ],
            on: {
              click: async () => {
                await router.navigateTo("/");
              },
            },
          },
          [
            createElement("i", {
              class: ["ph", "ph-sign-out", "text-3xl"],
            }),
            createElement("div", { class: ["max-lg:hidden", "lg:block"] }, [
              "Logout",
            ]),
          ]
        ),
      ]
    );
  },
  createList(this: IComponent<NavigationBarState>) {
    const Components = this.state.routes.map((e, i) =>
      createElement(NavigationItem, {
        path: e,
        current: this.state.current,
        icon: this.state.icons[i],
      })
    );
    return Components;
  },
});

export default NavigationBar;
