import { authState } from "@/Hooks/Auth";
import enhancedFetch from "@/Hooks/fetch";
import {
  createElement,
  createFragment,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";

interface IDashboardInterface {
  showFriend: boolean;
  hoverCards: any[];
}

const DashboardInterface = defineComponent<IDashboardInterface>({
  state() {
    return { showFriend: false, hoverCards: [0, 0, 0] };
  },

  render(
    this: IComponent<IDashboardInterface> & { sendInvite: () => Promise<void> }
  ) {
    return createElement(
      "section",
      {
        class: [
          "flex",
          "z-10",
          "gap-4",
          "w-full",
          "relative",
          "py-8",
          "px-6",
          "max-lg:py-4",
          "h-[75vh]",
          "max-lg:h-full",
          "my-auto",
        ],
        style: {},
      },
      [
        createElement(
          "div",
          {
            class: ["w-full", "h-full", "bg-no-repeat", "rounded-[30px]"],
            style: {
              "background-position": "center",
            },
          },
          [
            createElement(
              "div",
              {
                class: [
                  "w-full",
                  "h-full",
                  "flex-row",
                  "gap-5",
                  "justify-between",
                ],
              },
              [
                createElement(
                  "div",
                  {
                    class: ["w-[50%]", "h-full", "bg-black", "rounded-[30px]"],
                  },
                  ["ProfileInfo"]
                ),
                createElement(
                  "div",
                  {
                    class: [
                      "w-full",
                      "h-full",
                      "rounded-[30px]",
                      "flex-row",
                      "relative",
                    ],
                  },
                  [
                    createElement(
                      "div",
                      {
                        style: {
                          "clip-path": "polygon(0 0, 95% 0, 45% 100%, 0% 100%)",
                          "background-image": 'url("/assets/random.webp")',
                          "background-position": "center",
                          "background-repeat": "no-repeat",
                          "background-size": "cover",
                        },
                        class: [
                          "w-1/3",
                          "h-full",
                          "absolute",
                          "top-0",
                          "left-0",
                          "rounded-tl-[30px]",
                          "rounded-bl-[30px]",
                          "cursor-pointer",
                          this.state.hoverCards[0] ||
                          this.state.hoverCards.indexOf(1) === -1
                            ? "blur-none"
                            : "blur-sm",
                        ],
                        on: {
                          mouseenter: () => {
                            this.updateState({ hoverCards: [1, 0, 0] });
                          },
                          mouseleave: () => {
                            this.updateState({ hoverCards: [0, 0, 0] });
                          },
                        },
                      },
                      []
                    ),
                    createElement(
                      "div",
                      {
                        style: {
                          "clip-path":
                            "polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)",
                          transform: "translate(-50%, -50%)",
                          "background-image": 'url("/assets/tournament.webp")',
                          "background-position": "center",
                          "background-repeat": "no-repeat",
                          "background-size": "cover",
                        },
                        class: [
                          "w-2/3",
                          "h-full",
                          "absolute",
                          "top-[50%]",
                          "left-[50%]",
                          "cursor-pointer",
                          this.state.hoverCards[1] ||
                          this.state.hoverCards.indexOf(1) === -1
                            ? "blur-none"
                            : "blur-sm",
                          "relative",
                        ],
                        on: {
                          mouseenter: () => {
                            this.updateState({ hoverCards: [0, 1, 0] });
                          },
                          mouseleave: () => {
                            this.updateState({ hoverCards: [0, 0, 0] });
                          },
                        },
                      },
                      [
                        createElement(
                          "div",
                          {
                            class: [
                              "w-full",
                              "whitespace-nowrap",
                              "bg-[var(--light-yellow)]",
                              "text-black",
                              "max-h-6",
                              "pl-[50%]",
                            ],
                          },
                          [
                            "The international tournament, which brought together elite competitors from around the world",
                          ]
                        ),
                      ]
                    ),
                    createElement(
                      "div",
                      {
                        style: {
                          "clip-path":
                            " polygon(55% 0, 100% 0, 100% 100%, 5% 100%)",
                          "background-image": 'url("/assets/offline.webp")',
                          "background-position": "center",
                          "background-repeat": "no-repeat",
                          "background-size": "cover",
                        },
                        class: [
                          "w-1/3",
                          "h-full",
                          "absolute",
                          "right-0",
                          "rounded-tr-[30px]",
                          "rounded-br-[30px]",
                          "cursor-pointer",
                          this.state.hoverCards[2] ||
                          this.state.hoverCards.indexOf(1) === -1
                            ? "blur-none"
                            : "blur-sm",
                        ],
                        on: {
                          mouseenter: () => {
                            this.updateState({ hoverCards: [0, 0, 1] });
                          },
                          mouseleave: () => {
                            this.updateState({ hoverCards: [0, 0, 0] });
                          },
                        },
                      },
                      []
                    ),
                  ]
                ),
              ]
            ),
            createElement("div", { class: ["w-full", "h-full"] }, []),
          ]
        ),
        createElement(
          "div",
          {
            class: [
              this.state.showFriend ? "w-[35%]" : "w-[150px]",
              "border-2",
              "border-opacity-[30%]",
              "h-fit",
              "max-h-full",
              "rounded-[30px]",
              "border-[#878787]",
              "border-opacity-[30%]",
              "py-8",
              "px-6",
              "transition-all",
              "duration-[1s]",
              "ease-in-out",
            ],
            on: {
              mouseenter: (e) => {
                this.updateState({ showFriend: true });
              },
              mouseleave: (e) => {
                this.updateState({ showFriend: false });
              },
            },
          },
          [
            createElement(
              "div",
              {
                class: [
                  "w-full",
                  "h-full",
                  this.state.showFriend ? "items-start" : "items-center",
                  "gap-4",
                  "overflow-y-auto",
                  "overflow-x-hidden",
                  "[&::-webkit-scrollbar]:hidden",
                  "[-ms-overflow-style:none]",
                  "[scrollbar-width:none]",
                ],
              },
              [
                ...Array(53)
                  .fill(0)
                  .map((e) =>
                    createElement("div", { class: ["mb-auto", "w-full"] }, [
                      createElement(
                        "div",
                        { class: ["flex-row", "gap-5", "w-full"] },
                        [
                          createElement("img", {
                            src: "",
                            class: ["w-[75px]", "rounded-full"],
                          }),
                          this.state.showFriend
                            ? createFragment([
                                createElement(
                                  "div",
                                  {
                                    class: [
                                      "items-start",
                                      "w-full",

                                      "min-w-[200px]",
                                    ],
                                  },
                                  [
                                    createElement("p", {}, ["Ahmed Elqori"]),
                                    createElement(
                                      "span",
                                      { class: ["text-[var(--light-grey)]"] },
                                      [`@ael-qori`]
                                    ),
                                  ]
                                ),
                                createElement(
                                  "button",
                                  {
                                    class: [
                                      "flex-1",
                                      "rounded-2xl",
                                      "bg-[var(--light-yellow)]",
                                      "text-[var(--dark-black)]",
                                      "font-medium",
                                      "px-10",
                                      "py-2",
                                      "gap-2",
                                      "ml-auto",
                                      "text-lg",
                                      "text-center",
                                    ],
                                  },
                                  ["Play"]
                                ),
                              ])
                            : null,
                        ]
                      ),
                    ])
                  ),
              ]
            ),
          ]
        ),
      ]
    );
  },
});

export default DashboardInterface;
