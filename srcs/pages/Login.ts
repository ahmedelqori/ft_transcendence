import {
  createElement,
  defineComponent,
  eventBus,
} from "../uccello/Uccello.js";

const Login = defineComponent<void>({
  onMounted() {
    document.title = "Login";
  },
  state() {},
  render() {
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
            ["Let’s play"]
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
          createElement("div", {}, [
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
                    class: ["ph", "ph-arrow-up-right", "text-lg", "font-bold"],
                  },
                  []
                ),
              ]
            ),
          ]),
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
});

export default Login;

// createElement(
//         "button",
//         {
//           on: {
//             click: () => {
//               localStorage.setItem("user", JSON.stringify("Meedivo"));
//               eventBus.emit("auth:login");
//               router.navigateTo("/dashboard");
//             },
//           },
//         },
//         ["Click Me"]
//       ),
