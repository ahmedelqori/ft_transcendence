import {
  createApp,
  defineComponent,
  createElement,
  createFragment,
  IComponent,
  ELEMENT_INTER,
} from "./uccello/Uccello.js";

const ROOT: HTMLElement = document.getElementById("root") as HTMLElement;

interface IUser {
  id: string;
  name: string;
  status: string;
  lastMessage: string;
  time: string;
  isActive: boolean;
}

interface IMessage {
  id: string;
  user: string;
  text: string;
  time: string;
  isOwn: boolean;
}

interface IApp {
  users: IUser[];
  messages: IMessage[];
  currentMessage: string;
}

const App = defineComponent<IApp>({
  state() {
    return {
      users: [
        {
          id: "1",
          name: "Mason",
          status: "online",
          lastMessage: "Rally your way to Victory!",
          time: "5m",
          isActive: true,
        },
        {
          id: "2",
          name: "Ava",
          status: "online",
          lastMessage: "Ready to play!",
          time: "10m",
          isActive: false,
        },
        {
          id: "3",
          name: "Aiden",
          status: "offline",
          lastMessage: "The wait is yet to come",
          time: "30m",
          isActive: false,
        },
        {
          id: "4",
          name: "Finn",
          status: "online",
          lastMessage: "Ready, set, server!",
          time: "15m",
          isActive: false,
        },
        {
          id: "5",
          name: "Chloe",
          status: "online",
          lastMessage: "I'm ping pong where fun me",
          time: "2m",
          isActive: false,
        },
        {
          id: "6",
          name: "Lily",
          status: "online",
          lastMessage: "Smooth, and easy win",
          time: "15m",
          isActive: false,
        },
        {
          id: "7",
          name: "Nora",
          status: "online",
          lastMessage: "Rally your way to victory!",
          time: "1m",
          isActive: false,
        },
      ],
      messages: [
        {
          id: "1",
          user: "Mason",
          text: "Rally your way to victory!",
          time: "18:17",
          isOwn: true,
        },
        {
          id: "2",
          user: "Mason",
          text: "Okay let's begin!",
          time: "21:18",
          isOwn: true,
        },
      ],
      currentMessage: "",
    };
  },

  render(
    this: IComponent<IApp> & {
      sendMessage: () => void;
      updateMessage: (message: string) => void;
      selectUser: (userId: string) => void;
    }
  ) {
    const { users, messages, currentMessage } = this.state;

    return createElement(
      "div",
      {
        class: [
          "bg-gray-900",
          "h-screen",
          "flex",
          "text-white",
          "overflow-hidden",
        ],
      },
      [
        // User List
        createElement(
          "div",
          {
            class: [
              "w-72",
              "bg-black/30",
              "border-r",
              "border-gray-700",
              "p-4",
              "overflow-y-auto",
            ],
          },
          [
            createElement(
              "div",
              {
                class: ["mb-4"],
              },
              [
                createElement("input", {
                  type: "text",
                  placeholder: "Search, users...",
                  class: [
                    "w-full",
                    "bg-gray-800",
                    "text-white",
                    "p-2",
                    "rounded-lg",
                    "border",
                    "border-gray-700",
                    "focus:outline-none",
                    "focus:ring-2",
                    "focus:ring-green-500",
                  ],
                }),
              ]
            ),
            createElement(
              "ul",
              {},
              users.map((user) =>
                createElement(
                  "li",
                  {
                    class: [
                      "flex",
                      "items-center",
                      "p-2",
                      "rounded-lg",
                      "mb-2",
                      user.isActive ? "bg-green-900/50" : "hover:bg-gray-800",
                      "cursor-pointer",
                    ],
                    on: {
                      click: () => this.selectUser(user.id),
                    },
                  },
                  [
                    createElement("div", {
                      class: [
                        "w-10",
                        "h-10",
                        "bg-gray-700",
                        "rounded-full",
                        "mr-3",
                      ],
                    }),
                    createElement(
                      "div",
                      {
                        class: ["flex-grow"],
                      },
                      [
                        createElement(
                          "div",
                          {
                            class: ["font-semibold"],
                          },
                          [user.name]
                        ),
                        createElement(
                          "div",
                          {
                            class: ["text-xs", "text-gray-400"],
                          },
                          [user.lastMessage]
                        ),
                      ]
                    ),
                    createElement(
                      "div",
                      {
                        class: ["text-xs", "text-gray-400"],
                      },
                      [user.time]
                    ),
                  ]
                )
              )
            ),
          ]
        ),

        // Chat Area
        createElement(
          "div",
          {
            class: [
              "flex-grow",
              "flex",
              "flex-col",
              "bg-gradient-to-br",
              "from-gray-900",
              "to-green-900/50",
            ],
          },
          [
            // Chat Header
            createElement(
              "div",
              {
                class: [
                  "h-16",
                  "bg-black/30",
                  "flex",
                  "items-center",
                  "justify-between",
                  "px-4",
                ],
              },
              [
                createElement(
                  "div",
                  {
                    class: ["flex", "items-center"],
                  },
                  [
                    createElement("div", {
                      class: [
                        "w-12",
                        "h-12",
                        "bg-gray-700",
                        "rounded-full",
                        "mr-3",
                      ],
                    }),
                    createElement("div", {}, [
                      createElement(
                        "div",
                        {
                          class: ["font-semibold"],
                        },
                        ["Mason"]
                      ),
                      createElement(
                        "div",
                        {
                          class: ["text-xs", "text-green-500"],
                        },
                        ["online"]
                      ),
                    ]),
                  ]
                ),
                createElement(
                  "div",
                  {
                    class: ["flex", "items-center"],
                  },
                  [
                    createElement(
                      "button",
                      {
                        class: [
                          "bg-green-600",
                          "text-white",
                          "px-4",
                          "py-2",
                          "rounded-lg",
                          "mr-2",
                          "hover:bg-green-700",
                        ],
                      },
                      ["Let's play"]
                    ),
                    createElement(
                      "button",
                      {
                        class: [
                          "bg-gray-800",
                          "text-white",
                          "p-2",
                          "rounded-lg",
                          "hover:bg-gray-700",
                        ],
                      },
                      ["…"]
                    ),
                  ]
                ),
              ]
            ),

            // Messages
            createElement(
              "div",
              {
                class: ["flex-grow", "overflow-y-auto", "p-4", "space-y-3"],
              },
              messages.map((msg) =>
                createElement(
                  "div",
                  {
                    class: [
                      "flex",
                      msg.isOwn ? "justify-end" : "justify-start",
                    ],
                  },
                  [
                    createElement(
                      "div",
                      {
                        class: [
                          "max-w-md",
                          "p-3",
                          "rounded-lg",
                          //   msg.isOwn
                          //     ? "bg-green-600 text-white"
                          //     : "bg-gray-800 text-white",
                        ],
                      },
                      [
                        createElement("div", {}, [msg.text]),
                        createElement(
                          "div",
                          {
                            class: [
                              "text-xs",
                              "opacity-70",
                              "text-right",
                              "mt-1",
                            ],
                          },
                          [msg.time]
                        ),
                      ]
                    ),
                  ]
                )
              )
            ),

            // Message Input
            createElement(
              "div",
              {
                class: [
                  "h-16",
                  "bg-black/30",
                  "flex",
                  "items-center",
                  "px-4",
                  "space-x-2",
                ],
              },
              [
                createElement("input", {
                  type: "text",
                  placeholder: "Your message",
                  value: currentMessage,
                  class: [
                    "flex-grow",
                    "bg-gray-800",
                    "text-white",
                    "p-2",
                    "rounded-lg",
                    "border",
                    "border-gray-700",
                    "focus:outline-none",
                    "focus:ring-2",
                    "focus:ring-green-500",
                  ],
                  on: {
                    input: ({ target }) => this.updateMessage(target.value),
                    keydown: ({ key }) => {
                      if (key === "Enter" && currentMessage.trim()) {
                        this.sendMessage();
                      }
                    },
                  },
                }),
                createElement(
                  "button",
                  {
                    class: [
                      "bg-green-600",
                      "text-white",
                      "p-2",
                      "rounded-lg",
                      "hover:bg-green-700",
                    ],
                    on: {
                      click: this.sendMessage,
                    },
                  },
                  ["Send"]
                ),
              ]
            ),
          ]
        ),
      ]
    );
  },

  updateMessage(this: IComponent<IApp>, message: string) {
    this.updateState({ currentMessage: message });
  },

  sendMessage(this: IComponent<IApp>) {
    const { currentMessage, messages } = this.state;

    if (currentMessage.trim()) {
      const newMessage = {
        id: crypto.randomUUID(),
        user: "Mason",
        text: currentMessage,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: true,
      };

      this.updateState({
        messages: [...messages, newMessage],
        currentMessage: "",
      });
    }
  },

  selectUser(this: IComponent<IApp>, userId: string) {
    const updatedUsers = this.state.users.map((user) => ({
      ...user,
      isActive: user.id === userId,
    }));

    this.updateState({ users: updatedUsers });
  },
});

createApp(App).mount(ROOT);
