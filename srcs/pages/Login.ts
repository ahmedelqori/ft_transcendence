import {
  createElement,
  defineComponent,
  IComponent,
} from "../uccello/Uccello.js";

const Login = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "section",
      {
        class: ["flex", "flex-col", "items-center", "relative", "m-auto"],
      },
      [
        createElement(
          "div",
          { class: ["flex", "relative", "gap-4", "items-center", "w-1/2"] },
          [
            createElement(
              "p",
              {
                class: [
                  "text-9xl",
                  "font-semibold",
                  "leading-[140px]",
                  "tracking-wide",
                ],
              },
              ["Let’s play\nTogether..."]
            ),
            createElement("div", { class: ["w-1/2"] }, [
              createElement("img", {
                src: "../public/assets/hand.png",
                class: ["w-[540px]"],
              }),
            ]),
          ]
        ),
        // createElement("div", { class: ["w-1/2", "absolute", "z-[-1]"] }, [
        //   createElement("img", {
        //     src: "../public/assets/paddle.png",
        //     class: ["w-[676px]"],
        //     style: {
        //       right: "-100px",
        //     },
        //   }),
        // ]),
      ]
    );
  },
});

export default Login;
