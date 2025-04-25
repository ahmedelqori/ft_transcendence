// import enhancedFetch from "../Hooks/fetch.js";
// import { router } from "../router/Router.js";
// import {
//   createElement,
//   defineComponent,
//   eventBus,
//   IComponent,
// } from "../uccello/Uccello.js";

// const CLIENT_ID =
//   "u-s4t2ud-7242d27a6b163f72e29eb7e6f84704fea085ff18ada2ee69173cf0b00f5c2552";
// const CLIENT_SECRET =
//   "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";
// const REDIRECT_URI = "http://localhost:5500/#/dashboard";

// async function exchangeCodeForToken(code: string) {
//   const response = await fetch("https://api.intra.42.fr/oauth/token", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//     body: new URLSearchParams({
//       grant_type: "authorization_code",
//       client_id: CLIENT_ID,
//       client_secret: CLIENT_SECRET,
//       code: code,
//       redirect_uri: REDIRECT_URI,
//     }),
//   });
//   const data = await response.json();
//   console.log("Access Token:", data.access_token);
//   return data.access_token;
// }

// async function fetchUserInfo(token: string) {
//   const res = await fetch("https://api.intra.42.fr/v2/me", {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
//   const user = await res.json();
//   localStorage.setItem("user", JSON.stringify(user));
//   console.log("User info saved to localStorage:", user);
//   eventBus.emit("auth:login");
// }

// const Login = defineComponent<void>({
//   onMounted() {
//     document.title = "Login";

//     const urlParams = new URLSearchParams(window.location.search);
//     const code = urlParams.get("code");

//     if (code) {
//       this.processAuthCode(code);
//     }
//   },

//   state() {},

//   async processAuthCode(code: string) {
//     try {
//       const token = await exchangeCodeForToken(code);
//       if (token) {
//         await fetchUserInfo(token);
//         router.navigateTo("/dashboard");
//       }
//     } catch (err) {
//       console.error("Error processing authentication:", err);
//     }
//   },

//   initiateLogin() {
//     try {
//       const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
//         REDIRECT_URI
//       )}&response_type=code`;

//       window.location.href = authUrl;
//     } catch (err) {
//       console.error("Error initiating login:", err);
//     }
//   },

//   render(this: IComponent<void> & { initiateLogin: () => void }) {
//     return createElement(
//       "main",
//       { class: ["m-auto", "flex", "flex-col", "gap-8", "items-center"] },
//       [
//         createElement("div", {}, [
//           createElement(
//             "h2",
//             {
//               class: [
//                 "text-[128px]",
//                 "font-semibold",
//                 "leading-[150px]",
//                 "tracking-wider",
//               ],
//             },
//             ["Let's play"]
//           ),
//           createElement(
//             "h2",
//             {
//               class: [
//                 "text-[128px]",
//                 "font-semibold",
//                 "leading-[150px]",
//                 "tracking-wider",
//               ],
//             },
//             ["Together..."]
//           ),
//         ]),
//         createElement(
//           "h3",
//           { class: ["w-3/4", "text-center", "text-[var(--light-grey)]"] },
//           [
//             "we believe in the power of connection through play. Whether you're here to challenge your friends, make new ones",
//           ]
//         ),
//         createElement("div", { class: ["flex-row", "gap-10"] }, [
//           createElement(
//             "div",
//             {
//               on: {
//                 click: () => this.initiateLogin(),
//               },
//             },
//             [
//               createElement(
//                 "button",
//                 {
//                   class: [
//                     "rounded-2xl",
//                     "bg-[var(--main-color)]",
//                     "text-[var(--dark-black)]",
//                     "font-medium",
//                     "px-10",
//                     "py-2",
//                     "flex",
//                     "items-center",
//                     "justify-between",
//                     "gap-2",
//                   ],
//                 },
//                 [
//                   "42 intra",
//                   createElement(
//                     "i",
//                     {
//                       class: [
//                         "ph",
//                         "ph-arrow-up-right",
//                         "text-lg",
//                         "font-bold",
//                       ],
//                     },
//                     []
//                   ),
//                 ]
//               ),
//             ]
//           ),
//           createElement("div", {}, [
//             createElement(
//               "button",
//               {
//                 class: [
//                   "rounded-2xl",
//                   "bg-[var(--light-yellow)]",
//                   "text-[var(--dark-black)]",
//                   "font-medium",
//                   "px-10",
//                   "py-2",
//                   "flex",
//                   "items-center",
//                   "justify-between",
//                   "gap-2",
//                 ],
//               },
//               [
//                 "Google",
//                 createElement(
//                   "i",
//                   {
//                     class: ["ph", "ph-arrow-up-right", "text-lg", "font-bold"],
//                   },
//                   []
//                 ),
//               ]
//             ),
//           ]),
//         ]),
//       ]
//     );
//   },
// });

// export default Login;

import { router } from "../router/Router.js";
import {
  createElement,
  defineComponent,
  eventBus,
} from "../uccello/Uccello.js";

document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");
  const state = urlParams.get("state");

  if (code) {
    const savedState = sessionStorage.getItem("oauth_state");
    if (state && savedState === state) {
      sessionStorage.removeItem("oauth_state");

      sessionStorage.setItem("authCode", code);

      if (window.opener) {
        window.opener.postMessage(
          {
            type: "oauth-code",
            code: code,
          },
          window.location.origin
        );
        window.close();
      } else {
        window.history.replaceState({}, document.title, "/#/login");
        window.location.reload();
      }
    } else {
      console.error("OAuth state mismatch - possible CSRF attack");
    }
  }
});

const CLIENT_ID =
  "u-s4t2ud-7242d27a6b163f72e29eb7e6f84704fea085ff18ada2ee69173cf0b00f5c2552";
const CLIENT_SECRET =
  "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";
const REDIRECT_URI = "http://localhost:5500/";

async function exchangeCodeForToken(code: string) {
  try {
    const response = await fetch("https://api.intra.42.fr/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    });
    const data = await response.json();
    console.log("Access Token Received");
    return data.access_token;
  } catch (err) {
    console.error("Error exchanging code for token:", err);
    return null;
  }
}

async function fetchUserInfo(token: string) {
  try {
    const res = await fetch("https://api.intra.42.fr/v2/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const user = await res.json();
    localStorage.setItem("user", JSON.stringify(user));
    console.log("User info saved to localStorage");
    eventBus.emit("auth:login");
    return user;
  } catch (err) {
    console.error("Error fetching user info:", err);
    return null;
  }
}

const Login = defineComponent<void>({
  onMounted() {
    document.title = "Login";

    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const code = hashParams.get("code");

      if (code) {
        console.log("Auth code detected in hash");
        window.location.hash = "";
        this.processAuthCode(code);
      }
    }

    const storedCode = sessionStorage.getItem("authCode");
    if (storedCode) {
      console.log("Auth code detected in sessionStorage");
      sessionStorage.removeItem("authCode");
      this.processAuthCode(storedCode);
    }

    window.addEventListener(
      "message",
      this.handlePostMessage.bind(this),
      false
    );
  },

  onUnmounted() {
    window.removeEventListener("message", this.handlePostMessage.bind(this));
  },

  state() {},

  handlePostMessage(event: MessageEvent) {
    if (
      event.origin === window.location.origin &&
      event.data.type === "oauth-code"
    ) {
      this.processAuthCode(event.data.code);
    }
  },

  async processAuthCode(code: string) {
    try {
      const token = await exchangeCodeForToken(code);
      if (token) {
        const user = await fetchUserInfo(token);
        if (user) {
          router.navigateTo("/dashboard");
        }
      }
    } catch (err) {
      console.error("Error processing authentication:", err);
    }
  },

  initiateLogin() {
    try {
      const state = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem("oauth_state", state);

      const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
      )}&response_type=code&state=${state}`;

      window.location.href = authUrl;
    } catch (err) {
      console.error("Error initiating login:", err);
    }
  },

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
                click: () => this.initiateLogin(),
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
});

export default Login;
