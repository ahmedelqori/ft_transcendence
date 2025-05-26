import { authState } from "@/Hooks/Auth";
import enhancedFetch from "@/Hooks/fetch";
import {
  createElement,
  defineComponent,
  IComponent,
} from "@/uccello/Uccello.js";

interface EditSecurityState {
  twoFAImage: string;
  isEnable: boolean;
  isAlreadyEnable: boolean;
  code: any[];
}

const EditSecurity = defineComponent<EditSecurityState>({
  async onMounted(this: IComponent<EditSecurityState>) {
    try {
      const res = await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/2fa/is-enable`
      );

      const data = await res.json();
      this.updateState({
        isEnable: data.two_fa,
        isAlreadyEnable: true,
        twoFAImage: data.qr,
      });
    } catch (err) {}
  },
  state() {
    return {
      twoFAImage: "",
      isEnable: false,
      code: ["", "", "", "", "", ""],
      isAlreadyEnable: false,
    };
  },
  render(
    this: IComponent<EditSecurityState> & {
      activateTwoFA: () => Promise<void>;
      verifyTwoFA: () => Promise<void>;
    }
  ) {
    return createElement(
      "div",
      {
        class: [
          "w-full",
          "border-2",
          "rounded-[30px]",
          "border-[#878787]",
          "border-opacity-[30%]",
          "items-start",
          "px-[40px]",
          "py-[20px]",
          "gap-5",
          "h-full",
          "col-span-4",
          "row-span-3",
          "row-start-3",
          "flex-row",
        ],
      },
      [
        createElement("div", { class: ["w-full", "h-full", "items-start"] }, [
          createElement(
            "div",
            { class: ["w-full", "flex-row", "gap-5", "justify-between"] },
            [
              createElement("i", { class: ["ph", "ph-key", "text-4xl"] }),
              createElement("div", { class: ["items-start", "mr-auto"] }, [
                createElement("p", {}, ["Activate 2FA"]),
                createElement(
                  "span",
                  { class: ["text-[var(--light-grey)]", "text-sm"] },
                  [
                    "Authentication (2FA) adds an extra layer of security to your account.",
                  ]
                ),
              ]),
              createElement("div", {}, [
                createElement(
                  "label",
                  { class: ["inline-flex", "items-center", "cursor-pointer"] },
                  [
                    createElement("input", {
                      type: "checkbox",
                      checked: this.state.isEnable,
                      value: "",
                      class: ["sr-only", "peer"],
                      on: {
                        click: async () => this.activateTwoFA(),
                      },
                    }),
                    createElement("div", {
                      class: [
                        "relative",
                        "w-11",
                        "h-6",
                        "bg-transparent",
                        "peer-focus:outline-none",
                        "peer-focus:ring-4",
                        "peer-focus:ring-[var(--light-yellow)]",
                        "dark:peer-focus:ring-[var(--light-yellow)]",
                        "rounded-full",
                        "peer",
                        "dark:bg-gray-700",
                        "peer-checked:after:translate-x-full",
                        "rtl:peer-checked:after:-translate-x-full",
                        "peer-checked:after:border-transparent",
                        "after:content-['']",
                        "after:absolute",
                        "after:top-[2px]",
                        "after:start-[2px]",
                        "after:bg-white",
                        "after:border-gray-300",
                        "after:border",
                        "after:rounded-full",
                        "after:h-5",
                        "after:w-5",
                        "after:transition-all",
                        "dark:border-gray-600",
                        "peer-checked:bg-[var(--light-grey)]",
                        "dark:peer-checked:bg-[var(--light-yellow)]",
                      ],
                    }),
                  ]
                ),
              ]),
            ]
          ),
          createElement(
            "div",
            { class: ["w-full", "h-full", "items-start", "flex-row"] },
            [
              this.state.isEnable && !this.state.isAlreadyEnable
                ? createElement(
                    "div",
                    {
                      class: [
                        "items-start",
                        "justify-start",
                        "text-left",
                        "gap-4",
                        "my-auto",
                        "w-full",
                        "flex-row",
                      ],
                    },
                    [
                      ...this.state.code.map((el, i) => {
                        const valueInput = this.state.code[i];
                        return createElement(
                          "input",
                          {
                            maxlength: "1",
                            inputmode: "numeric",
                            pattern: "[0-9]*",
                            type: "text",
                            value: valueInput,
                            class: [
                              "w-[45px]",
                              "h-[75px]",
                              "border-[1px]",
                              "text-center",
                              "rounded-[14px]",
                              "text-[#878787]",
                              "bg-transparent",
                              "border-[#878787]",
                              "focus:outline-none",
                              "focus:border-[#828c3a]",
                              "transition-all",
                              "text-xl",
                            ],
                            id: `input-2fa-${i}`,
                            on: {
                              input: async (e) => {
                                if (e.target.value.length >= 2) {
                                  e.target.value = "";
                                  return;
                                }
                                this.updateState({
                                  code: this.state.code.map((el, index) =>
                                    i == index ? e.target.value[0] : el
                                  ),
                                });
                                document
                                  ?.getElementById(`input-2fa-${i + 1}`)
                                  ?.focus();
                                if (
                                  this.state.code.filter((e) => e.length)
                                    .length === 6
                                )
                                  await this.verifyTwoFA();
                              },
                            },
                          },
                          []
                        );
                      }),
                    ]
                  )
                : createElement(
                    "div",
                    {
                      class: [
                        "items-start",
                        "justify-start",
                        "text-left",
                        "gap-4",
                        "my-auto",
                        "w-full",
                      ],
                    },
                    [
                      createElement(
                        "h4",
                        { class: ["text-xl", "font-medium"] },
                        ["Activation Steps"]
                      ),
                      createElement(
                        "div",
                        { class: ["items-start", "gap-3", "max-w-80"] },
                        [
                          createElement(
                            "ol",
                            { class: ["list-disc", "ml-8"] },
                            [
                              createElement(
                                "li",
                                {
                                  class: [
                                    "text-[12px]",
                                    "text-[var(--light-grey)]",
                                  ],
                                },
                                ["Click on Enable 2FA."]
                              ),
                              createElement(
                                "li",
                                {
                                  class: [
                                    "text-[12px]",
                                    "text-[var(--light-grey)]",
                                  ],
                                },
                                [
                                  "Scan the QR code using an authenticator app (e.g. Google Authenticator, Authy).",
                                ]
                              ),
                              createElement(
                                "li",
                                {
                                  class: [
                                    "text-[12px]",
                                    "text-[var(--light-grey)]",
                                  ],
                                },
                                [
                                  "Enter the 6-digit code from your app to verify.",
                                ]
                              ),
                              createElement(
                                "li",
                                {
                                  class: [
                                    "text-[12px]",
                                    "text-[var(--light-grey)]",
                                  ],
                                },
                                ["2FA will be enabled for future logins."]
                              ),
                            ]
                          ),
                        ]
                      ),
                    ]
                  ),

              createElement("div", {
                class: [
                  "h-3/4",
                  "w-[4px]",
                  "bg-[var(--light-grey)]",
                  "opacity-[30%]",
                  "rounded-full",
                  "m-auto",
                ],
              }),
              createElement(
                "div",
                { class: ["w-full", "h-full", "m-auto", "relative"] },
                [
                  createElement("img", {
                    src: this.state.isEnable
                      ? this.state.twoFAImage
                      : "/assets/qr-code.webp",
                    class: ["w-[70%]", "m-auto"],
                    style: {
                      filter: this.state.isEnable ? "blur(0)" : "blur(0.4rem)",
                    },
                  }),
                  // createElement("i", {
                  //   class: [
                  //     "ph",
                  //     "ph-lock-laminated",
                  //     "absolute",
                  //     "text-6xl",
                  //     "font-semibold",
                  //     "text-white",
                  //     "top-1/2",
                  //     "left-1/2",
                  //     "transform",
                  //     "-translate-x-1/2",
                  //     "-translate-y-1/2",
                  //   ],
                  // }),
                ]
              ),
            ]
          ),
        ]),
        // createElement("div", {
        //   class: [
        //     "h-full",
        //     "w-[4px]",
        //     "bg-white",
        //     "opacity-[30%]",
        //     "rounded-full",
        //     "m-auto",
        //   ],
        // }),
        createElement("div", { class: ["w-full", "h-full", "gap-8"] }, [
          createElement(
            "div",
            { class: ["w-full", "flex-row", "gap-5", "justify-between"] },
            [
              createElement("i", {
                class: ["ph", "ph-feather", "text-4xl"],
              }),
              createElement("div", { class: ["items-start", "mr-auto"] }, [
                createElement("p", {}, ["About your self"]),
                createElement(
                  "span",
                  { class: ["text-[var(--light-grey)]", "text-sm"] },
                  ["A quick glance at who I am and what I do."]
                ),
              ]),
            ]
          ),
          createElement("textarea", {
            placeholder: authState.getState().user?.bio
              ? authState.getState().user?.bio
              : `My Name is ${authState.getState().user?.username}`,

            class: [
              "resize-none",
              "px-4",
              "py-4",
              "w-full",
              "h-full",
              "focus:border-2",
              "outline-none",
              "rounded-[14px]",
              "placeholder-[var(--light-grey)]",
              "text-[var(--light-grey)]",
              "text-opacity-5",
              "bg-transparent",
              "focus:outline-none",
              "focus:border-[#828c3a]",
              "transition-all",
              "mx-auto",
            ],
          }),
        ]),
      ]
    );
  },
  async activateTwoFA(this: IComponent<EditSecurityState>) {
    if (this.state.isEnable) {
      try {
        await enhancedFetch.fetch(
          `${import.meta.env.VITE_URL_DEV}/api/2fa/disable`,
          {
            method: "DELETE",
          }
        );
        this.updateState({ isEnable: false, isAlreadyEnable: false });
      } catch (err) {}

      return;
    }
    try {
      const res = await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/2fa/enable`,
        {
          method: "POST",
        }
      );

      const data = await res.json();
      this.updateState({
        isEnable: true,
        twoFAImage: data.qr!,
        isAlreadyEnable: false,
      });
    } catch (err) {
      console.log(err);
    }
  },
  async verifyTwoFA(this: IComponent<EditSecurityState>) {
    try {
      const res = await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/2fa/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code: this.state.code.join("") }),
        }
      );

      if (!res.ok) throw "incorrect code";
      const response = await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/2fa/is-enable`
      );

      const data = await response.json();
      this.updateState({
        isEnable: data.two_fa,
        isAlreadyEnable: true,
        twoFAImage: data.qr,
      });
    } catch (err) {
      console.log(err);
    }
  },
});

export default EditSecurity;
