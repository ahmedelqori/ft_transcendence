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
            "text-[#878787]",

            "hover:text-[#ddf247]",
          ],
        },
        [
          createElement("i", {
            class: ["ph", this.props.icon, "text-3xl"],
          }),
          createElement("div", {}, [
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
          "ml-[40px]",
          "h-[65%]",
          "justify-around",
          "items-start",
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
              "text-[#878787]",
              "hover:text-[#ddf247]",
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
            createElement("div", {}, ["Logout"]),
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
