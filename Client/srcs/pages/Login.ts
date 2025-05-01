import { router } from "../router/Router.js";
import {
  createElement,
  defineComponent,
  eventBus,
  IComponent,
} from "../uccello/Uccello.js";

const CLIENT_ID =
  "u-s4t2ud-7242d27a6b163f72e29eb7e6f84704fea085ff18ada2ee69173cf0b00f5c2552";
const CLIENT_SECRET =
  "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";
const REDIRECT_URI = "http://localhost:5500/";

const Login = defineComponent<void>({
  state() {},

  render(this: IComponent<void> & { loginWithFortyTwo: () => void }) {
    return createElement(
      "main",
      { class: ["m-auto", "flex", "flex-col", "gap-8", "items-center"] },
      [
        createElement("div", {}, [
          createElement(
            "h2",
            {
              class: [
                "text-[128px]",
                "font-semibold",
                "leading-[150px]",
                "tracking-wider",
              ],
            },
            ["Let's play"]
          ),
          createElement(
            "h2",
            {
              class: [
                "text-[128px]",
                "font-semibold",
                "leading-[150px]",
                "tracking-wider",
              ],
            },
            ["Together..."]
          ),
        ]),
        createElement(
          "h3",
          { class: ["w-3/4", "text-center", "text-[var(--light-grey)]"] },
          [
            "we believe in the power of connection through play. Whether you're here to challenge your friends, make new ones",
          ]
        ),
        createElement("div", { class: ["flex-row", "gap-10"] }, [
          createElement(
            "div",
            {
              on: {
                click: () => this.loginWithFortyTwo(),
              },
            },
            [
              createElement(
                "button",
                {
                  class: [
                    "rounded-2xl",
                    "bg-[var(--main-color)]",
                    "text-[var(--dark-black)]",
                    "font-medium",
                    "px-10",
                    "py-2",
                    "flex",
                    "items-center",
                    "justify-between",
                    "gap-2",
                  ],
                },
                [
                  "42 intra",
                  createElement(
                    "i",
                    {
                      class: [
                        "ph",
                        "ph-arrow-up-right",
                        "text-lg",
                        "font-bold",
                      ],
                    },
                    []
                  ),
                ]
              ),
            ]
          ),
          createElement("div", {}, [
            createElement(
              "button",
              {
                class: [
                  "rounded-2xl",
                  "bg-[var(--light-yellow)]",
                  "text-[var(--dark-black)]",
                  "font-medium",
                  "px-10",
                  "py-2",
                  "flex",
                  "items-center",
                  "justify-between",
                  "gap-2",
                ],
              },
              [
                "Google",
                createElement(
                  "i",
                  {
                    class: ["ph", "ph-arrow-up-right", "text-lg", "font-bold"],
                  },
                  []
                ),
              ]
            ),
          ]),
        ]),
      ]
    );
  },

  async loginWithFortyTwo() {
    window.location.href = "https://64.23.191.17/api/account/login/42/";
  },
});

export default Login;
