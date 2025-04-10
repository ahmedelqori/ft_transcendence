import {
  createElement,
  defineComponent,
  RouterLink,
} from "../../../uccello/Uccello.js";

const NavigationBar = defineComponent<void>({
  state() {},
  render() {
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
        createElement(RouterLink, { to: "/" }, [
          createElement(
            "div",
            {
              class: ["flex", "flex-row", "justify-between", "gap-3"],
            },
            [
              createElement("i", {
                class: ["ph", "ph-house-simple", "text-3xl"],
              }),
              createElement(
                "div",
                {
                  class: ["text-[#878787]"],
                },
                ["Home"]
              ),
            ]
          ),
        ]),
        createElement(RouterLink, { to: "/game" }, [
          createElement(
            "div",
            {
              class: ["flex", "flex-row", "gap-3"],
            },
            [
              createElement("i", {
                class: ["ph", "ph-ping-pong", "text-3xl"],
              }),
              createElement(
                "div",
                {
                  class: ["text-[#878787]"],
                },
                ["Game"]
              ),
            ]
          ),
        ]),
        createElement(RouterLink, { to: "/chat" }, [
          createElement(
            "div",
            {
              class: ["flex", "flex-row", "gap-3"],
            },
            [
              createElement("i", {
                class: ["ph", "ph-chats", "text-3xl"],
              }),
              createElement(
                "div",
                {
                  class: ["text-[#878787]"],
                },
                ["Chat"]
              ),
            ]
          ),
        ]),
        createElement(RouterLink, { to: "/tournament" }, [
          createElement(
            "div",
            {
              class: ["flex", "flex-row", "gap-3"],
            },
            [
              createElement("i", {
                class: ["ph", "ph-trophy", "text-3xl"],
              }),
              createElement(
                "div",
                {
                  class: ["text-[#878787]"],
                },
                ["Tournament"]
              ),
            ]
          ),
        ]),
        createElement(RouterLink, { to: "/leaderboard" }, [
          createElement(
            "div",
            {
              class: ["flex", "flex-row", "gap-3"],
            },
            [
              createElement("i", {
                class: ["ph", "ph-ranking", "text-3xl"],
              }),
              createElement(
                "div",
                {
                  class: ["text-[#878787]"],
                },
                ["LeaderBoard"]
              ),
            ]
          ),
        ]),
        createElement(RouterLink, { to: "/settings" }, [
          createElement(
            "div",
            {
              class: ["flex", "flex-row", "gap-3"],
            },
            [
              createElement("i", {
                class: ["ph", "ph-gear", "text-3xl"],
              }),
              createElement(
                "div",
                {
                  class: ["text-[#878787]"],
                },
                ["Settings"]
              ),
            ]
          ),
        ]),

        createElement(
          "div",
          {
            class: ["flex", "flex-row", "gap-3"],
          },
          [
            createElement("i", {
              class: ["ph", "ph-sign-out", "text-3xl"],
            }),
            createElement(
              "div",
              {
                class: ["text-[#878787]"],
              },
              ["Logout"]
            ),
          ]
        ),
      ]
    );
  },
});

export default NavigationBar;
