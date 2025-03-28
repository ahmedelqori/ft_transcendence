// import {
//   createApp,
//   defineComponent,
//   createElement,
//   IComponent,
// } from "./uccello/Uccello.js";

// const ROOT: HTMLElement = document.getElementById("root") as HTMLElement;
// interface IUser {
//   id: string;
//   username: string;
//   avatar: string;
//   bio: string;
// }

// interface IRecentUser {
//   id: string;
//   username: string;
//   avatar: string;
//   date: string;
// }

// interface ITopPlayer {
//   id: string;
//   username: string;
//   avatar: string;
//   rank: number;
// }

// interface IApp {
//   user: IUser;
//   recentUsers: IRecentUser[];
//   topPlayers: ITopPlayer[];
//   isAvatarUploaded: boolean;
//   is2FAEnabled: boolean;
// }

// const App = defineComponent<IApp>({
//   state() {
//     return {
//       user: {
//         id: "1",
//         username: "zibnoukh",
//         avatar: "/api/placeholder/100/100",
//         bio: "",
//       },
//       recentUsers: [
//         {
//           id: "1",
//           username: "Propw",
//           avatar: "/api/placeholder/50/50",
//           date: "Mon, 08 May",
//         },
//         {
//           id: "2",
//           username: "Propw",
//           avatar: "/api/placeholder/50/50",
//           date: "Mon, 08 May",
//         },
//         {
//           id: "3",
//           username: "Propw",
//           avatar: "/api/placeholder/50/50",
//           date: "Mon, 08 May",
//         },
//       ],
//       topPlayers: [
//         {
//           id: "1",
//           username: "Propw",
//           avatar: "/api/placeholder/50/50",
//           rank: 1,
//         },
//         {
//           id: "2",
//           username: "Propw",
//           avatar: "/api/placeholder/50/50",
//           rank: 2,
//         },
//         {
//           id: "3",
//           username: "Propw",
//           avatar: "/api/placeholder/50/50",
//           rank: 3,
//         },
//         {
//           id: "4",
//           username: "Propw",
//           avatar: "/api/placeholder/50/50",
//           rank: 4,
//         },
//       ],
//       isAvatarUploaded: false,
//       is2FAEnabled: false,
//     };
//   },

//   render(
//     this: IComponent<IApp> & {
//       updateUsername: (username: string) => void;
//       updateBio: (bio: string) => void;
//       toggleAvatarUpload: () => void;
//       toggle2FA: () => void;
//       handleFileUpload: (event: Event) => void;
//     }
//   ) {
//     const { user, recentUsers, topPlayers, isAvatarUploaded, is2FAEnabled } =
//       this.state;

//     return createElement(
//       "div",
//       { class: "bg-[#111] min-h-screen text-white flex" },
//       [
//         // Sidebar Navigation
//         createElement(
//           "div",
//           { class: "w-64 bg-[#1a1a1a] p-6 border-r border-[#2a2a2a]" },
//           [
//             // Logo
//             createElement("div", { class: "flex items-center mb-10" }, [
//               createElement("img", {
//                 src: "/api/placeholder/40/40",
//                 class: "w-10 h-10 bg-[#22f] rounded-lg mr-3",
//               }),
//               createElement(
//                 "span",
//                 { class: "text-2xl font-bold text-[#22f]" },
//                 ["Open9"]
//               ),
//             ]),
//             // Menu Items
//             createElement(
//               "ul",
//               { class: "space-y-4" },
//               [
//                 "Home",
//                 "Game",
//                 "Chat",
//                 "Tournament",
//                 "Leaderboard",
//                 "Settings",
//                 "Logout",
//               ].map((item) =>
//                 createElement(
//                   "li",
//                   {
//                     class: `flex items-center p-2 rounded-lg ${
//                       item === "Settings"
//                         ? "bg-[#22f]/20 text-[#22f]"
//                         : "hover:bg-[#2a2a2a] text-gray-400"
//                     }`,
//                   },
//                   [createElement("span", { class: "ml-3" }, [item])]
//                 )
//               )
//             ),
//           ]
//         ),

//         // Main Content
//         createElement("div", { class: "flex-grow p-8 flex" }, [
//           // Settings Section
//           createElement("div", { class: "w-2/3 pr-8" }, [
//             createElement("h1", { class: "text-3xl font-bold mb-6" }, [
//               "Settings",
//             ]),

//             // Avatar Upload
//             createElement("div", { class: "mb-6" }, [
//               createElement("h2", { class: "text-xl mb-4" }, [
//                 "Edit your avatar",
//               ]),
//               createElement("div", { class: "flex items-center" }, [
//                 createElement("img", {
//                   src: user.avatar,
//                   class: "w-20 h-20 rounded-full mr-6",
//                 }),
//                 createElement("div", { class: "flex items-center" }, [
//                   createElement("input", {
//                     type: "file",
//                     class: "hidden",
//                     id: "avatar-upload",
//                     on: { change: this.handleFileUpload },
//                   }),
//                   createElement(
//                     "label",
//                     {
//                       for: "avatar-upload",
//                       class:
//                         "bg-[#22f] text-white px-4 py-2 rounded-lg mr-4 cursor-pointer",
//                     },
//                     ["Choose file"]
//                   ),
//                   createElement("span", { class: "text-gray-500" }, [
//                     isAvatarUploaded ? "1 file selected" : "No file selected",
//                   ]),
//                 ]),
//               ]),
//             ]),

//             // Profile Edit
//             createElement("div", { class: "mb-6" }, [
//               createElement("h2", { class: "text-xl mb-4" }, [
//                 "Edit your profile",
//               ]),
//               createElement("div", { class: "space-y-4" }, [
//                 createElement("input", {
//                   type: "text",
//                   placeholder: "Your name*",
//                   value: user.username,
//                   class:
//                     "w-full bg-[#1a1a1a] p-3 rounded-lg border border-[#2a2a2a]",
//                   on: {
//                     input: ({ target }) => this.updateUsername(target.value),
//                   },
//                 }),
//                 createElement("textarea", {
//                   placeholder: "Say something about yourself...",
//                   value: user.bio,
//                   class:
//                     "w-full bg-[#1a1a1a] p-3 rounded-lg border border-[#2a2a2a] h-24",
//                   on: { input: ({ target }) => this.updateBio(target.value) },
//                 }),
//               ]),
//             ]),

//             // 2FA Toggle
//             createElement(
//               "div",
//               {
//                 class:
//                   "flex items-center justify-between bg-[#1a1a1a] p-4 rounded-lg",
//               },
//               [
//                 createElement("span", {}, ["Activate 2FA"]),
//                 createElement(
//                   "div",
//                   {
//                     class: `w-12 h-6 bg-${
//                       is2FAEnabled ? "[#22f]" : "gray-600"
//                     } rounded-full relative cursor-pointer`,
//                     on: { click: this.toggle2FA },
//                   },
//                   [
//                     createElement("div", {
//                       class: `absolute top-0.5 ${
//                         is2FAEnabled ? "right-0.5" : "left-0.5"
//                       } w-5 h-5 bg-white rounded-full transition-all`,
//                     }),
//                   ]
//                 ),
//               ]
//             ),

//             // Save/Cancel Buttons
//             createElement("div", { class: "flex mt-6 space-x-4" }, [
//               createElement(
//                 "button",
//                 { class: "bg-gray-700 text-white px-6 py-2 rounded-lg" },
//                 ["Cancel"]
//               ),
//               createElement(
//                 "button",
//                 { class: "bg-[#22f] text-white px-6 py-2 rounded-lg" },
//                 ["Save"]
//               ),
//             ]),
//           ]),

//           // Sidebar Sections
//           createElement("div", { class: "w-1/3 space-y-6" }, [
//             // Recently Added
//             createElement("div", { class: "bg-[#1a1a1a] rounded-lg p-4" }, [
//               createElement("h3", { class: "text-lg font-semibold mb-4" }, [
//                 "Recently added",
//               ]),
//               createElement(
//                 "ul",
//                 { class: "space-y-3" },
//                 recentUsers.map((recentUser) =>
//                   createElement("li", { class: "flex items-center" }, [
//                     createElement("img", {
//                       src: recentUser.avatar,
//                       class: "w-10 h-10 rounded-full mr-3",
//                     }),
//                     createElement("div", { class: "flex-grow" }, [
//                       createElement("p", { class: "font-medium" }, [
//                         recentUser.username,
//                       ]),
//                       createElement("p", { class: "text-xs text-gray-500" }, [
//                         recentUser.date,
//                       ]),
//                     ]),
//                   ])
//                 )
//               ),
//             ]),

//             // Top Players
//             createElement("div", { class: "bg-[#1a1a1a] rounded-lg p-4" }, [
//               createElement("h3", { class: "text-lg font-semibold mb-4" }, [
//                 "Top players",
//               ]),
//               createElement(
//                 "ul",
//                 { class: "space-y-3" },
//                 topPlayers.map((player) =>
//                   createElement(
//                     "li",
//                     { class: "flex items-center justify-between" },
//                     [
//                       createElement("div", { class: "flex items-center" }, [
//                         createElement("img", {
//                           src: player.avatar,
//                           class: "w-10 h-10 rounded-full mr-3",
//                         }),
//                         createElement("p", { class: "font-medium" }, [
//                           player.username,
//                         ]),
//                       ]),
//                       createElement(
//                         "button",
//                         {
//                           class:
//                             "bg-[#22f]/20 text-[#22f] px-4 py-1 rounded-lg",
//                         },
//                         ["Message"]
//                       ),
//                     ]
//                   )
//                 )
//               ),
//             ]),
//           ]),
//         ]),
//       ]
//     );
//   },

//   updateUsername(this: IComponent<IApp>, username: string) {
//     this.updateState({
//       user: { ...this.state.user, username },
//     });
//   },

//   updateBio(this: IComponent<IApp>, bio: string) {
//     this.updateState({
//       user: { ...this.state.user, bio },
//     });
//   },

//   handleFileUpload(this: IComponent<IApp>, event: Event) {
//     const input = event.target as HTMLInputElement;
//     if (input.files && input.files.length > 0) {
//       this.updateState({
//         isAvatarUploaded: true,
//       });
//     }
//   },

//   toggleAvatarUpload(this: IComponent<IApp>) {
//     this.updateState({
//       isAvatarUploaded: !this.state.isAvatarUploaded,
//     });
//   },

//   toggle2FA(this: IComponent<IApp>) {
//     this.updateState({
//       is2FAEnabled: !this.state.is2FAEnabled,
//     });
//   },
// });

// createApp(App).mount(ROOT);

// import {
//   createApp,
//   createElement,
//   defineComponent,
//   IComponent,
// } from "./uccello/Uccello.js";

// const ROOT: HTMLElement = document.getElementById("root")!;

// interface IApp {
//   nameApp: string;
// }

// interface ISubComp {
//   n: boolean;
// }
// interface PSubComp {
//   test: string;
// }
// const SubComp = defineComponent({
//   render(this: IComponent) {
//     console.log(this.props);
//     console.log(this.state);
//     return createElement("h1");
//   },
// });

// const App = defineComponent<IApp>({
//   state: () => {
//     return { nameApp: "Meedivo" };
//   },
//   render(this: IComponent<IApp>) {
//     return createElement(
//       "input",
//       {
//         on: {
//           click: () => {
//             this.updateState({ nameApp: "Hello Word" });
//           },
//         },
//       },
//       [this.state.nameApp, createElement(SubComp, { test: "ahmed" })]
//     );
//   },
// });

// createApp(App).mount(ROOT);

// import App from "./completed/Chat.js";
// import { createApp } from "./uccello/Uccello.js";

// createApp(App).mount(ROOT);

import {
  createApp,
  createElement,
  createFragment,
  defineComponent,
  IComponent,
} from "./uccello/Uccello.js";
let i = 0;
const NameComponent = defineComponent({
  onMounted() {
    i += 2000;
    setTimeout(() => {
      console.log(`Component mounted with name: ${this.props.name}`);
    }, i);
  },
  render() {
    return createElement("p", {}, [this.props.name]);
  },
});
const App = defineComponent({
  render() {
    return createFragment([
      createElement(NameComponent, { name: "Alice" }),
      createElement(NameComponent, { name: "Bob" }),
      createElement(NameComponent, { name: "Charlie" }),
      createElement(NameComponent, { name: "Diana" }),
      createElement(NameComponent, { name: "Eve" }),
    ]);
  },
});
createApp(App).mount(document.body);
