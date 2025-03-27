import {
  createApp,
  defineComponent,
  createElement,
  IComponent,
} from "../uccello/Uccello.js";

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

interface IConversation {
  userId: string;
  messages: IMessage[];
}

interface IApp {
  users: IUser[];
  conversations: { [userId: string]: IMessage[] };
  currentMessage: string;
  activeUserId: string | null;
}

const App = defineComponent<IApp>({
  state() {
    return {
      users: [
        {
          id: "1",
          name: "Mason",
          status: "online",
          lastMessage: "Hello!",
          time: "5m",
          isActive: true,
        },
        {
          id: "2",
          name: "Ava",
          status: "online",
          lastMessage: "Let's go!",
          time: "10m",
          isActive: false,
        },
        {
          id: "3",
          name: "Aiden",
          status: "offline",
          lastMessage: "BRB",
          time: "30m",
          isActive: false,
        },
      ],
      conversations: {
        "1": [
          {
            id: "1",
            user: "Mason",
            text: "Hey, ready to play?",
            time: "18:17",
            isOwn: true,
          },
        ],
        "2": [
          {
            id: "1",
            user: "Ava",
            text: "Hi there!",
            time: "18:15",
            isOwn: false,
          },
        ],
        "3": [
          {
            id: "1",
            user: "Aiden",
            text: "What's up?",
            time: "18:10",
            isOwn: false,
          },
        ],
      },
      currentMessage: "",
      activeUserId: "1",
    };
  },

  render(
    this: IComponent<IApp> & {
      sendMessage: () => void;
      updateMessage: (msg: string) => void;
      selectUser: (id: string) => void;
    }
  ) {
    const { users, conversations, currentMessage, activeUserId } = this.state;
    const activeUser = users.find((user) => user.id === activeUserId);
    const currentConversation = activeUserId ? conversations[activeUserId] : [];

    return createElement(
      "div",
      { class: "bg-slate-900 h-screen flex text-white overflow-hidden" },
      [
        // Sidebar - User List
        createElement(
          "div",
          {
            class:
              "w-72 bg-slate-800/50 border-r border-slate-700 p-4 overflow-y-auto",
          },
          [
            createElement("input", {
              type: "text",
              placeholder: "Search users...",
              class:
                "w-full bg-slate-700 text-white p-2 rounded-lg border border-slate-600 focus:ring-2 focus:ring-teal-500",
            }),
            createElement(
              "ul",
              {},
              users.map((user) =>
                createElement(
                  "li",
                  {
                    class: `flex items-center p-3 rounded-lg mb-2 cursor-pointer transition-colors duration-200 ${
                      user.id === activeUserId
                        ? "bg-teal-700/50"
                        : "hover:bg-slate-700"
                    }`,
                    on: { click: () => this.selectUser(user.id) },
                  },
                  [
                    createElement("div", {
                      class: "w-10 h-10 bg-slate-600 rounded-full mr-3",
                    }),
                    createElement("div", {}, [
                      createElement("p", { class: "font-semibold" }, [
                        user.name,
                      ]),
                      createElement("p", { class: "text-xs text-slate-400" }, [
                        user.lastMessage,
                      ]),
                    ]),
                    createElement(
                      "p",
                      { class: "text-xs text-slate-400 ml-auto" },
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
            class:
              "flex-grow flex flex-col bg-gradient-to-br from-slate-900 to-teal-900/30",
          },
          [
            // Chat Header
            createElement(
              "div",
              {
                class:
                  "h-16 bg-slate-800/50 flex items-center justify-between px-4",
              },
              [
                createElement("div", { class: "flex items-center" }, [
                  createElement("div", {
                    class: "w-12 h-12 bg-slate-600 rounded-full mr-3",
                  }),
                  createElement("div", {}, [
                    createElement("p", { class: "font-semibold" }, [
                      activeUser?.name || "Select a user",
                    ]),
                    createElement("p", { class: "text-xs text-teal-500" }, [
                      activeUser?.status || "No user selected",
                    ]),
                  ]),
                ]),
                createElement(
                  "button",
                  {
                    class:
                      "bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors duration-200",
                  },
                  ["Let's play"]
                ),
              ]
            ),

            // Messages
            createElement(
              "div",
              { class: "flex-grow overflow-y-auto p-4 space-y-3" },
              currentConversation.map((msg) =>
                createElement(
                  "div",
                  {
                    class: `flex ${
                      msg.isOwn ? "justify-end" : "justify-start"
                    }`,
                  },
                  [
                    createElement(
                      "div",
                      {
                        class: `max-w-md p-3 rounded-lg ${
                          msg.isOwn
                            ? "bg-teal-600 text-white"
                            : "bg-slate-700 text-white"
                        }`,
                      },
                      [
                        createElement("p", {}, [msg.text]),
                        createElement(
                          "p",
                          { class: "text-xs opacity-70 text-right mt-1" },
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
                class: "h-16 bg-slate-800/50 flex items-center px-4 space-x-2",
              },
              [
                createElement("input", {
                  type: "text",
                  placeholder: "Type a message...",
                  value: currentMessage,
                  disabled: !activeUserId,
                  class:
                    "flex-grow bg-slate-700 text-white p-2 rounded-lg border border-slate-600 focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed",
                  on: {
                    input: ({ target }) => this.updateMessage(target.value),
                    keydown: ({ key }) => {
                      if (
                        key === "Enter" &&
                        currentMessage.trim() &&
                        activeUserId
                      ) {
                        this.sendMessage();
                      }
                    },
                  },
                }),
                createElement(
                  "button",
                  {
                    disabled: !activeUserId,
                    class:
                      "bg-teal-600 text-white p-2 rounded-lg hover:bg-teal-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                    on: { click: this.sendMessage },
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
    const { currentMessage, conversations, activeUserId } = this.state;

    if (currentMessage.trim() && activeUserId) {
      const newMessage = {
        id: crypto.randomUUID(),
        user: "Mason", // Always from Mason for simplicity
        text: currentMessage,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: true,
      };

      // Create a new conversation array for the active user, adding the new message
      const updatedConversations = {
        ...conversations,
        [activeUserId]: [...(conversations[activeUserId] || []), newMessage],
      };

      // Update the last message for the active user
      const updatedUsers = this.state.users.map((user) =>
        user.id === activeUserId
          ? { ...user, lastMessage: currentMessage, time: "now" }
          : user
      );

      this.updateState({
        conversations: updatedConversations,
        currentMessage: "",
        users: updatedUsers,
      });
    }
  },

  selectUser(this: IComponent<IApp>, userId: string) {
    const updatedUsers = this.state.users.map((user) => ({
      ...user,
      isActive: user.id === userId,
    }));
    this.updateState({
      users: updatedUsers,
      activeUserId: userId,
      currentMessage: "",
    });
  },
});

createApp(App).mount(ROOT);
