import { router } from "@/router/Router";
import {
  defineComponent,
  createElement,
  eventBus,
  IComponent,
  createFragment,
} from "../uccello/Uccello.js";
import enhancedFetch from "@/Hooks/fetch.js";
import { authState } from "@/Hooks/Auth.js";

interface TwoFAState {
  code: string[];
  isLoading: boolean;
}

const TwoFA = defineComponent<TwoFAState>({
  async onMounted() {
    try {
      if (authState.getState().isAuthenticated) {
        router.navigateTo("/dashboard");
        return;
      }

      localStorage.setItem(
        "access_token",
        (router.getParams as any).accessToken!
      );
      const res = await fetch("https://www.meedivo.me/api/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${(router.getParams as any).accessToken!}`,
        },
        body: JSON.stringify({ code: "" }),
      });
      if (res.status == 401) throw "Unauthorized";
      this.updateState({ isLoading: false });
    } catch (err) {
      router.navigateTo("/login");
      authState.setState({
        isAuthenticated: false,
        user: null,
      });
      localStorage.clear();
      console.log(err);
    }
  },
  state() {
    return { code: ["", "", "", "", "", ""], isLoading: true };
  },
  render(this: IComponent<TwoFAState> & { verifyToken: () => Promise<void> }) {
    return createElement(
      "div",
      {
        class: [
          "flex",
          "items-center",
          "justify-center",
          "h-full",
          "w-full",
          "bg-transparent",
          "gap-4",
        ],
      },
      [
        !this.state.isLoading
          ? createFragment([
              createElement("div", { class: ["flex-row", "gap-5"] }, [
                ...this.state.code.map((el, i) => {
                  const valueInput = this.state.code[i];
                  return createElement("input", {
                    maxlength: "1",
                    inputmode: "numeric",
                    pattern: "[0-9]*",
                    type: "text",
                    value: valueInput,
                    class: [
                      "w-[75px]",
                      "h-[75px]",
                      "border-[1px]",
                      "text-center",
                      "rounded-[14px]",
                      "text-[var(--light-yellow)]",
                      "bg-transparent",
                      "border-[#878787]",
                      "focus:outline-none",
                      // "focus:border-[#828c3a]",
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
                        if (this.state.code.join("")?.length === 6)
                          await this.verifyToken();
                        if (this.state.code[i].length)
                          document
                            ?.getElementById(`input-2fa-${i + 1}`)
                            ?.focus();
                      },
                    },
                  });
                }),
              ]),
              createElement(
                "div",
                {
                  class: "relative w-fit h-fit",
                },
                [
                  createElement("i", {
                    class: [
                      "text-white",
                      "ph",
                      "ph-fingerprint",
                      "text-6xl",
                      "font-medium",
                      "relative",
                    ],
                    style: {
                      backgroundImage: `linear-gradient(to top, yellow ${
                        (this.state.code.join("").length * 100) / 6
                      }%, white ${6}%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    },
                    on: {
                      click: async () => this.verifyToken(),
                    },
                  }),
                ]
              ),
            ])
          : createElement("div", {
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
    );
  },
  async verifyToken(this: IComponent<TwoFAState>) {
    try {
      this.updateState({ isLoading: true });
      const res = await fetch("https://www.meedivo.me/api/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${(router.getParams as any).accessToken!}`,
        },
        body: JSON.stringify({ code: this.state.code.join("") }),
      });
      if (res.status == 400) throw "invalid input";
      const data = await res.json();
      console.log("--Data", data);
      localStorage.setItem("access_token", data.access_token);
      const response = await enhancedFetch.fetch(
        "https://www.meedivo.me/api/account/whoami/"
      );
      let userdata = await response.json();
      authState.setState({
        isAuthenticated: true,
        user: {
          username: userdata.username,
          id: userdata.id,
          avatar: userdata.avatar_url,
        },
      });
      router.navigateTo("/dashboard");
    } catch (err) {
      authState.setState({
        isAuthenticated: false,
        user: null,
      });
      localStorage.clear();
      this.updateState({ isLoading: false });
    }
  },
});

export default TwoFA;
