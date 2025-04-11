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
                class: ["ph", "ph-house-simple", "text-3xl"],
              }),
              createElement("div", {}, ["Home"]),
            ]
          ),
        ]),
        createElement(
          RouterLink,
          { to: "/game", class: ["hover:text-[#ddf247]"] },
          [
            createElement(
              "div",
              {
                class: [
                  "flex",
                  "flex-row",
                  "gap-3",
                  "text-[#878787]",
                  "hover:text-[#ddf247]",
                ],
              },
              [
                createElement("i", {
                  class: ["ph", "ph-ping-pong", "text-3xl"],
                }),
                createElement("div", {}, ["Game"]),
              ]
            ),
          ]
        ),
        createElement(RouterLink, { to: "/chat" }, [
          createElement(
            "div",
            {
              class: [
                "flex",
                "flex-row",
                "gap-3",
                "text-[#878787]",
                "hover:text-[#ddf247]",
              ],
            },
            [
              createElement("i", {
                class: ["ph", "ph-chats", "text-3xl"],
              }),
              createElement("div", {}, ["Chat"]),
            ]
          ),
        ]),
        createElement(RouterLink, { to: "/tournament" }, [
          createElement(
            "div",
            {
              class: [
                "flex",
                "flex-row",
                "gap-3",
                "text-[#878787]",
                "hover:text-[#ddf247]",
              ],
            },
            [
              createElement("i", {
                class: ["ph", "ph-trophy", "text-3xl"],
              }),
              createElement("div", {}, ["Tournament"]),
            ]
          ),
        ]),
        createElement(RouterLink, { to: "/leaderboard" }, [
          createElement(
            "div",
            {
              class: [
                "flex",
                "flex-row",
                "gap-3",
                "text-[#878787]",
                "hover:text-[#ddf247]",
              ],
            },
            [
              createElement("i", {
                class: ["ph", "ph-ranking", "text-3xl"],
              }),
              createElement("div", {}, ["LeaderBoard"]),
            ]
          ),
        ]),
        createElement(RouterLink, { to: "/settings" }, [
          createElement(
            "div",
            {
              class: [
                "flex",
                "flex-row",
                "gap-3",
                "text-[#878787]",
                "hover:text-[#ddf247]",
              ],
            },
            [
              createElement("i", {
                class: ["ph", "ph-gear", "text-3xl"],
              }),
              createElement("div", {}, ["Settings"]),
            ]
          ),
        ]),

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
              click: () => {
                console.log("Logout");
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
});

export default NavigationBar;
