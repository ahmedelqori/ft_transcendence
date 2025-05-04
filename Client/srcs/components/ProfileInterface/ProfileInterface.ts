import enhancedFetch from "../../Hooks/fetch.js";
import {
  createElement,
  createFragment,
  defineComponent,
  IComponent,
} from "../../uccello/Uccello.js";

interface ProfileInterfaceProps {
  username: string;
  whoami: string;
}

interface ProfileInterfaceState {
  avatar: any;
  isLoading: boolean;
  found: boolean;
}
const ProfileInterface = defineComponent<
  ProfileInterfaceState,
  ProfileInterfaceProps
>({
  async onMounted(
    this: IComponent<ProfileInterfaceState, ProfileInterfaceProps>
  ) {
    try {
      document.title = this.props.username;
      const res = await enhancedFetch.fetch(
        `https://64.23.191.17/api/account/${this.props.username}`
      );
      const user = await res.json();
      console.log(user);
      setTimeout(() => {
        this.updateState({
          avatar: user.avatar_url,
          found: true,
          isLoading: false,
        });
      }, 1000);
    } catch (err) {
      console.log(err);
    }
  },
  state() {
    return { avatar: null, isLoading: true, found: false };
  },
  render(this: IComponent<ProfileInterfaceState, ProfileInterfaceProps>) {
    return createElement(
      "div",
      {
        class: [
          "p-5",
          "flex",
          "w-[90%]",
          "h-full",
          "items-center",
          "flex-row",
          "gap-[40px]",
          "justify-center",
          "overflow-hidden",
        ],
      },
      [
        this.state.isLoading
          ? createElement(
              "div",
              {
                class: [
                  "items-center",
                  "justify-center",
                  "h-full",
                  "w-full",
                  "bg-transparent",
                ],
              },
              [
                createElement("div", {
                  class: [
                    "animate-spin",
                    "rounded-full",
                    "h-16",
                    "w-16",
                    "border-4",
                    "border-[var(--light-yellow)]",
                    "border-t-transparent",
                  ],
                }),
              ]
            )
          : !this.state.found
          ? createElement("div", {}, ["NotFound"])
          : createFragment([
              createElement(
                "img",
                {
                  src: this.state.avatar,
                  class: ["rounded-full", "w-[200px]", "h-[200px]"],
                },
                []
              ),
              createElement(
                "div",
                {
                  class: ["gap-8", "w-[40%]"],
                },
                [
                  createElement(
                    "div",
                    { class: ["flex-row", "justify-end", "gap-4", "w-full"] },
                    [
                      createElement(
                        "button",
                        {
                          class: [
                            "z-10",
                            "px-10",
                            "py-2",
                            "gap-2",
                            "text-lg",
                            "flex-row",
                            "rounded-xl",
                            "font-medium",
                            "text-black",
                            "cursor-pointer",
                            "bg-[var(--main-color)]",
                          ],
                        },
                        ["Join Tour"]
                      ),
                      createElement(
                        "button",
                        {
                          class: [
                            "z-10",
                            "px-6",
                            "py-2",
                            "gap-2",
                            "text-lg",
                            "flex-row",
                            "rounded-xl",
                            "font-medium",
                            "text-black",
                            "cursor-pointer",
                            "bg-[var(--light-yellow)]",
                          ],
                        },
                        ["Start Game"]
                      ),
                    ]
                  ),
                  createElement(
                    "div",
                    { class: ["items-start", "w-full", "gap-2"] },
                    [
                      createElement(
                        "h4",
                        { class: ["text-3xl", "font-semibold"] },
                        [this.props.username]
                      ),
                      createElement(
                        "p",
                        { class: ["text-[var(--light-grey)]", "text-sm"] },
                        ["Joined at 7-Jul-25"]
                      ),
                      createElement("div", { class: ["w-full", "gap-2"] }, [
                        createElement(
                          "h5",
                          {
                            class: [
                              "text-[var(--light-grey)]",
                              "text-sm",
                              "self-end",
                            ],
                          },
                          ["4000/8000xp"]
                        ),
                        createElement(
                          "div",
                          {
                            class: [
                              "w-full",
                              "bg-white",
                              "rounded-full",
                              "h-2.5",
                              "items-start",
                            ],
                          },
                          [
                            createElement("div", {
                              class: [
                                "bg-[var(--light-yellow)]",
                                "h-2.5",
                                "rounded-full",
                              ],
                              style: {
                                width: "50%",
                              },
                            }),
                          ]
                        ),
                      ]),
                    ]
                  ),
                  createElement(
                    "div",
                    { class: ["flex-row", "w-full", "mt-4"] },
                    [
                      createElement("div", { class: ["flex-row", "gap-4"] }, [
                        createElement("i", {
                          class: [
                            "ph",
                            "ph-trophy",
                            "text-4xl",
                            "text-[var(--dark-black)]",
                            "bg-[var(--main-color)]",
                            "rounded-[12px]",
                            "p-2",
                          ],
                        }),
                        createElement("div", { class: "items-start" }, [
                          createElement(
                            "p",
                            {
                              class: [
                                "text-[var(--main-color)]",
                                "text-2xl",
                                "font-bold",
                              ],
                            },
                            ["27"]
                          ),
                          createElement(
                            "p",
                            { class: ["text-[var(--light-grey)]", "text-sm"] },
                            ["Games Win"]
                          ),
                        ]),
                      ]),
                      createElement("div", { class: ["flex-row", "gap-4"] }, [
                        createElement("i", {
                          class: [
                            "ph",
                            "ph-flag",
                            "text-4xl",
                            "text-[var(--dark-black)]",
                            "bg-[var(--main-color)]",
                            "rounded-[12px]",
                            "p-2",
                          ],
                        }),
                        createElement("div", { class: "items-start" }, [
                          createElement(
                            "p",
                            {
                              class: [
                                "text-[var(--main-color)]",
                                "text-2xl",
                                "font-bold",
                              ],
                            },
                            ["9"]
                          ),
                          createElement(
                            "p",
                            { class: ["text-[var(--light-grey)]", "text-sm"] },
                            ["Games Lose"]
                          ),
                        ]),
                      ]),
                      createElement("div", { class: ["flex-row", "gap-4"] }, [
                        createElement("i", {
                          class: [
                            "ph",
                            "ph-shooting-star",
                            "text-4xl",
                            "text-[var(--dark-black)]",
                            "bg-[var(--main-color)]",
                            "rounded-[12px]",
                            "p-2",
                          ],
                        }),
                        createElement("div", { class: "items-start" }, [
                          createElement(
                            "p",
                            {
                              class: [
                                "text-[var(--main-color)]",
                                "text-2xl",
                                "font-bold",
                              ],
                            },
                            ["32"]
                          ),
                          createElement(
                            "p",
                            { class: ["text-[var(--light-grey)]", "text-sm"] },
                            ["highest score"]
                          ),
                        ]),
                      ]),
                    ]
                  ),
                  createElement("div", { class: ["w-full", "mt-11"] }, [
                    createElement(
                      "p",
                      {
                        class: [
                          "text-[var(--main-color)]",
                          "text-md",
                          "self-start",
                          "font-semibold",
                        ],
                      },
                      ["Achievements"]
                    ),
                    createElement("div", { class: ["w-full", "gap-2"] }, [
                      createElement(
                        "h5",
                        {
                          class: [
                            "text-[var(--light-grey)]",
                            "text-sm",
                            "self-end",
                          ],
                        },
                        ["22/100"]
                      ),
                      createElement(
                        "div",
                        {
                          class: [
                            "w-full",
                            "bg-white",
                            "rounded-full",
                            "h-2.5",
                            "items-start",
                          ],
                        },
                        [
                          createElement("div", {
                            class: [
                              "bg-[var(--light-yellow)]",
                              "h-2.5",
                              "rounded-full",
                            ],
                            style: {
                              width: "22%",
                            },
                          }),
                        ]
                      ),
                    ]),
                  ]),
                ]
              ),
            ]),
      ]
    );
  },
});

export default ProfileInterface;
