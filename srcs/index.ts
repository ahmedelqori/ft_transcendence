import { router } from "./Router.js";
import {
  createApp,
  createElement,
  createFragment,
  createSlot,
  defineComponent,
  IComponent,
  makeMatcherWithParams,
  RouterLink,
  RouterOutlet,
} from "./uccello/Uccello.js";

const ROOT = document.getElementById("root")!;

const NavBarConnect = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "nav",
      {
        class: ["w-full"],
      },
      [
        createElement(
          "a",
          {
            class: ["flex", "items-center", "justify-between"],
          },
          [
            createElement(RouterLink, { to: "/" }, [
              createElement("img", {
                class: ["cursor-pointer"],
                src: "../public/assets/logo.png",
                on: {
                  click: () => {
                    console.log("hello  ");
                  },
                },
              }),
            ]),

            createElement(RouterLink, { to: "/login" }, [
              createElement(
                "a",
                {
                  href: "https://google.com",
                  class: [
                    "w-160",
                    "border-2px",
                    "bg-white",
                    "text-black",
                    "font-semibold",
                    "px-5",
                    "py-2",
                    "rounded-md",
                    "flex",
                    "items-center",
                    "gap-2",
                  ],
                },
                [
                  "Connect",
                  createElement("i", {
                    class: [
                      "fa-solid",
                      "fa-arrow-up-right-dots",
                      "text-black",
                      "w-[10px]",
                      "text-black",
                    ],
                  }),
                ]
              ),
            ]),
          ]
        ),
      ]
    );
  },
});

// interface StateHero {
//   quote: string;
// }

// export const Hero = defineComponent<StateHero>({
//   async onMounted(this: IComponent<StateHero> & { generate: () => void }) {
//     // this.generate();
//     // setInterval(() => {
//     //   this.generate();
//     // }, 4000);
//   },
//   state(): StateHero {
//     return { quote: "" };
//   },
//   render(this: IComponent<StateHero> & { generate: () => void }) {
//     return createElement(
//       "section",
//       { class: ["flex", "flex-row", "items-center", "flex-1"] },
//       [
//         createElement(
//           "div",
//           { class: ["w-1/2", "flex", "flex-col", "gap-4"] },
//           [
//             createElement(
//               "p",
//               {
//                 class: ["text-8xl", "font-semibold", "leading-[112px]"],
//               },
//               ["Ping Pong Showdown: The Ultimate Battle for the Net!"]
//             ),
//             createElement(
//               "p",
//               {
//                 style: {
//                   color: "var(--light-grey)",
//                 },
//                 class: ["font-semibold"],
//                 on: {
//                   click: this.generate,
//                 },
//               },
//               [this.state.quote]
//             ),
//           ]
//         ),
//         createElement("div", { class: ["w-1/2"] }, [
//           createElement("img", {
//             src: "../public/assets/paddle.png",
//             class: ["w-[676px]"],
//           }),
//         ]),
//       ]
//     );
//   },
//   async generate(this: IComponent<StateHero>) {
//     try {
//       const res: Response = await fetch("http://localhost:3000/quote");
//       const data = await res.json();
//       this.updateState({ quote: data.quote });
//     } catch (error) {
//       console.error("Error fetching quote:", error);
//     }
//   },
// });

const Explore = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "div",
      { class: ["flex", "flex-row", "justify-between"] },
      [
        createElement(
          "p",
          {
            style: {
              color: "var(--light-grey)",
            },
            class: ["font-semibold", "text-sm"],
          },
          ["@2025 OpeN9"]
        ),
        createElement(
          "a",
          {
            class: [
              "font-semibold",
              "text-2xl",
              "flex",
              "gap-2",
              "items-center",
            ],
          },
          [
            "EXPLORE",
            createElement("i", {
              class: [
                "fa-solid",
                "fa-arrow-up-right-dots",
                "text-black",
                "w-[10px]",
                "text-white",
              ],
            }),
          ]
        ),
      ]
    );
  },
});

interface IApp {
  value: string;
}

const App = defineComponent<IApp>({
  state(): IApp {
    return { value: "" };
  },
  render(this: IComponent<IApp>) {
    return createElement(
      "div",
      {
        class: ["containerd", "flex", "flex-col", "gap-y-0", "justify-between"],
      },
      [
        createElement(NavBarConnect),
        createElement(RouterOutlet),
        createElement(Explore),
      ]
    );
  },
});

createApp(App, {}, { router }).mount(ROOT);
