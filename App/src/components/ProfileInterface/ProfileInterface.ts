import enhancedFetch from "@/Hooks/fetch.js";
import {
  createElement,
  createFragment,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";

interface ProfileInterfaceProps {
  username: string;
  whoami: string;
}

interface ProfileInterfaceState {
  avatar: any;
  isLoading: boolean;
  createdAt: string | null;
  found: boolean;
  animationComplete: boolean;
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
      if (!res.ok) {
        throw res;
      }
      const user = await res.json();
      const isoDate = user.created_at;
      const date = new Date(isoDate);

      const day = date.getUTCDate();
      const month = date.toLocaleString("en-US", {
        month: "short",
        timeZone: "UTC",
      });
      const year = date.getUTCFullYear().toString().slice(-2);

      const formattedDate = `${day}-${month}-${year}`;

      setTimeout(() => {
        this.updateState({
          avatar: user.avatar_url,
          found: true,
          isLoading: false,
          createdAt: formattedDate,
          animationComplete: false,
        });

        setTimeout(() => {
          this.updateState({
            animationComplete: true,
          });
        }, 800);
      }, 1000);
    } catch (err: any) {
      if (err.status === 404)
        this.updateState({
          avatar: null,
          found: false,
          isLoading: false,
          createdAt: null,
          animationComplete: false,
        });
    }
  },
  state() {
    return {
      avatar: null,
      isLoading: true,
      found: false,
      createdAt: null,
      animationComplete: false,
    };
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
          ? createElement(
              "div",
              {
                class: [
                  "flex",
                  "flex-col",
                  "items-center",
                  "justify-center",
                  "h-full",
                  "rounded-xl",
                  "p-10",
                  "shadow-md",
                  "text-center",
                  "max-w-md",
                  "mx-auto",
                ],
              },
              [
                createElement("i", {
                  class: [
                    "ph",
                    "ph-ghost",
                    "text-8xl",
                    "mb-6",
                    "p-4",
                    "rounded-full",
                  ],
                }),
                createElement(
                  "h2",
                  {
                    class: [
                      "text-3xl",
                      "font-bold",
                      "text-[var(--main-color)]",
                      "mb-3",
                    ],
                  },
                  ["User Not Found"]
                ),
                createElement(
                  "p",
                  {
                    class: ["text-gray-500", "text-lg", "max-w-md"],
                  },
                  [
                    "We couldn't find any profile with the username ",
                    createElement(
                      "span",
                      {
                        class: ["font-semibold", "text-[var(--light-yellow)]"],
                      },
                      [this.props.username]
                    ),
                    ". Please check the spelling or try again later.",
                  ]
                ),
              ]
            )
          : createFragment([
              createElement(
                "img",
                {
                  src: this.state.avatar,
                  class: [
                    "rounded-full",
                    "w-[200px]",
                    "h-[200px]",
                    "transition-all",
                    "duration-500",
                    "animate-fadeIn",
                    "shadow-lg",
                    "border-4",
                    "border-[var(--main-color)]",
                    "hover:scale-105",
                    "hover:border-[var(--light-yellow)]",
                  ],
                  style: {
                    animation: "fadeIn 0.8s ease-in-out",
                  },
                },
                []
              ),
              createElement(
                "div",
                {
                  class: [
                    "gap-8",
                    "w-[40%]",
                    "transition-all",
                    "duration-500",
                    "animate-slideRight",
                  ],
                  style: {
                    animation: "slideRight 0.6s ease-out",
                  },
                },
                [
                  createElement(
                    "div",
                    {
                      class: ["flex-row", "justify-end", "gap-4", "w-full"],
                    },
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
                            "transition-all",
                            "duration-300",
                            "hover:bg-[var(--light-yellow)]",
                            "hover:shadow-md",
                            "transform",
                            "hover:-translate-y-1",
                            this.state.animationComplete
                              ? "opacity-100"
                              : "opacity-0",
                          ],
                          style: {
                            transitionDelay: "300ms",
                          },
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
                            "transition-all",
                            "duration-300",
                            "hover:bg-[var(--main-color)]",
                            "hover:shadow-md",
                            "transform",
                            "hover:-translate-y-1",
                            this.state.animationComplete
                              ? "opacity-100"
                              : "opacity-0",
                          ],
                          style: {
                            transitionDelay: "400ms",
                          },
                        },
                        ["Start Game"]
                      ),
                    ]
                  ),
                  createElement(
                    "div",
                    {
                      class: [
                        "items-start",
                        "w-full",
                        "gap-2",
                        "transition-all",
                        "duration-500",
                        this.state.animationComplete
                          ? "opacity-100"
                          : "opacity-0",
                      ],
                      style: {
                        transitionDelay: "200ms",
                      },
                    },
                    [
                      createElement(
                        "h4",
                        {
                          class: [
                            "text-3xl",
                            "font-semibold",
                            "transition-all",
                            "duration-300",
                            "text-[var(--main-color)]",
                            "hover:text-[var(--light-yellow)]",
                          ],
                        },
                        [this.props.username]
                      ),
                      createElement(
                        "p",
                        {
                          class: [
                            "text-[var(--light-grey)]",
                            "text-sm",
                            "transition-all",
                            "duration-300",
                          ],
                        },
                        [`Joined at ${this.state.createdAt}`]
                      ),
                      createElement(
                        "div",
                        {
                          class: ["w-full", "gap-2", "mt-2"],
                        },
                        [
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
                                "overflow-hidden",
                              ],
                            },
                            [
                              createElement("div", {
                                class: [
                                  "bg-[var(--light-yellow)]",
                                  "h-2.5",
                                  "rounded-full",
                                  "transition-all",
                                  "duration-1000",
                                ],
                                style: {
                                  width: this.state.animationComplete
                                    ? "50%"
                                    : "0%",
                                  transitionDelay: "600ms",
                                },
                              }),
                            ]
                          ),
                        ]
                      ),
                    ]
                  ),
                  createElement(
                    "div",
                    {
                      class: [
                        "flex-row",
                        "w-full",
                        "mt-4",
                        "justify-between",
                        "transition-all",
                        "duration-500",
                        "opacity-0",
                        this.state.animationComplete
                          ? "opacity-100"
                          : "opacity-0",
                      ],
                      style: {
                        transitionDelay: "500ms",
                      },
                    },
                    [
                      createElement(
                        "div",
                        {
                          class: [
                            "flex-row",
                            "gap-4",
                            "transform",
                            "transition-all",
                            "duration-300",
                            "hover:scale-105",
                          ],
                        },
                        [
                          createElement("i", {
                            class: [
                              "ph",
                              "ph-trophy",
                              "text-4xl",
                              "text-[var(--dark-black)]",
                              "bg-[var(--main-color)]",
                              "rounded-[12px]",
                              "p-2",
                              "transition-all",
                              "duration-300",
                              "hover:bg-[var(--light-yellow)]",
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
                              {
                                class: ["text-[var(--light-grey)]", "text-sm"],
                              },
                              ["Games Win"]
                            ),
                          ]),
                        ]
                      ),
                      createElement(
                        "div",
                        {
                          class: [
                            "flex-row",
                            "gap-4",
                            "transform",
                            "transition-all",
                            "duration-300",
                            "hover:scale-105",
                          ],
                        },
                        [
                          createElement("i", {
                            class: [
                              "ph",
                              "ph-flag",
                              "text-4xl",
                              "text-[var(--dark-black)]",
                              "bg-[var(--main-color)]",
                              "rounded-[12px]",
                              "p-2",
                              "transition-all",
                              "duration-300",
                              "hover:bg-[var(--light-yellow)]",
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
                              {
                                class: ["text-[var(--light-grey)]", "text-sm"],
                              },
                              ["Games Lose"]
                            ),
                          ]),
                        ]
                      ),
                      createElement(
                        "div",
                        {
                          class: [
                            "flex-row",
                            "gap-4",
                            "transform",
                            "transition-all",
                            "duration-300",
                            "hover:scale-105",
                          ],
                        },
                        [
                          createElement("i", {
                            class: [
                              "ph",
                              "ph-shooting-star",
                              "text-4xl",
                              "text-[var(--dark-black)]",
                              "bg-[var(--main-color)]",
                              "rounded-[12px]",
                              "p-2",
                              "transition-all",
                              "duration-300",
                              "hover:bg-[var(--light-yellow)]",
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
                              {
                                class: ["text-[var(--light-grey)]", "text-sm"],
                              },
                              ["highest score"]
                            ),
                          ]),
                        ]
                      ),
                    ]
                  ),
                  createElement(
                    "div",
                    {
                      class: [
                        "w-full",
                        "mt-11",
                        "transition-all",
                        "duration-500",
                        this.state.animationComplete
                          ? "opacity-100"
                          : "opacity-0",
                      ],
                      style: {
                        transitionDelay: "700ms",
                      },
                    },
                    [
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
                              "overflow-hidden",
                            ],
                          },
                          [
                            createElement("div", {
                              class: [
                                "bg-[var(--light-yellow)]",
                                "h-2.5",
                                "rounded-full",
                                "transition-all",
                                "duration-1000",
                              ],
                              style: {
                                width: this.state.animationComplete
                                  ? "22%"
                                  : "0%",
                                transitionDelay: "800ms",
                              },
                            }),
                          ]
                        ),
                      ]),
                    ]
                  ),
                ]
              ),
            ]),
      ]
    );
  },
});

const style = document.createElement("style");
style.innerHTML = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideRight {
    from { 
      opacity: 0;
      transform: translateX(-20px);
    }
    to { 
      opacity: 1;
      transform: translateX(0);
    }
  }
`;
document.head.appendChild(style);

export default ProfileInterface;
