import { createElement, defineComponent } from "@/uccello/Uccello.js";
import { router } from "@/router/Router.js";

const GameSetup = defineComponent<void>({
  onMounted() {
    document.title = "Game Setup";
  },
  
  state() {},
  
  render() {
    return createElement(
      "main",
      {
        class: [
          "flex",
          "flex-col",
          "w-full",
          "h-screen", 
          "items-center",
          "px-4",
          "py-2",
          "overflow-hidden"
        ]
      },
      [
        createElement(
          "div", 
          { class: ["pt-4"] },
          [
            createElement(
              "h1",
              {
                class: [
                  "text-3xl",
                  "font-bold",
                  "text-[var(--light-yellow)]"
                ]
              },
              ["Select Game Mode"]
            )
          ]
        ),
        
        createElement(
          "div",
          {
            class: [
              "flex",
              "flex-row",
              "gap-8",
              "justify-center",
              "max-w-4xl",
              "w-full",
              "max-md:flex-col",
              "my-auto"
            ]
          },
          [
            createElement(
              "div",
              {
                class: [
                  "flex",
                  "flex-col",
                  "items-center",
                  "justify-center",
                  "text-center",
                  "bg-[var(--dark-grey)]",
                  "rounded-xl",
                  "p-6",
                  "shadow-lg",
                  "border-2",
                  "border-[#878787]",
                  "border-opacity-30",
                  "h-[360px]",
                  "w-[300px]",
                  "hover:border-[var(--light-yellow)]",
                  "transition-all",
                  "duration-300",
                  "cursor-pointer"
                ],
                on: {
                  click: () => {
                    router.navigateTo("/localGame");
                  }
                }
              },
              [
                createElement(
                  "div",
                  {
                    class: [
                      "flex",
                      "items-center",
                      "mb-4"
                    ]
                  },
                  [
                    createElement(
                      "i",
                      {
                        class: [
                          "ph",
                          "ph-monitors",
                          "text-6xl",
                          "text-[var(--light-yellow)]",
                          "mr-2"
                        ]
                      }
                    ),
                    createElement(
                      "i",
                      {
                        class: [
                          "ph",
                          "ph-game-controller",
                          "text-6xl",
                          "text-[var(--light-yellow)]",
                          "ml-2"
                        ]
                      }
                    )
                  ]
                ),
                createElement(
                  "h2",
                  {
                    class: [
                      "text-2xl",
                      "font-bold",
                      "mb-2",
                      "text-white"
                    ]
                  },
                  ["Local Game"]
                ),
                createElement(
                  "p",
                  {
                    class: [
                      "text-center",
                      "text-[var(--light-grey)]",
                      "mb-4"
                    ]
                  },
                  ["Play against a friend on the same device. Take turns controlling paddles with keyboard controls."]
                )
              ]
            ),
            
            createElement(
              "div",
              {
                class: [
                  "flex",
                  "flex-col",
                  "items-center",
                  "justify-center",
                  "text-center",
                  "bg-[var(--dark-grey)]",
                  "rounded-xl",
                  "p-6",
                  "shadow-lg",
                  "border-2",
                  "border-[#878787]",
                  "border-opacity-30",
                  "h-[360px]",
                  "w-[300px]",
                  "hover:border-[var(--light-yellow)]",
                  "transition-all",
                  "duration-300",
                  "cursor-pointer"
                ],
                on: {
                  click: () => {
                    router.navigateTo("/Game/:gameId");
                  }
                }
              },
              [
                createElement(
                  "i",
                  {
                    class: [
                      "ph",
                      "ph-globe",
                      "text-6xl",
                      "mb-4",
                      "text-[var(--light-yellow)]"
                    ]
                  }
                ),
                createElement(
                  "h2",
                  {
                    class: [
                      "text-2xl",
                      "font-bold",
                      "mb-2",
                      "text-white"
                    ]
                  },
                  ["Online Game"]
                ),
                createElement(
                  "p",
                  {
                    class: [
                      "text-center",
                      "text-[var(--light-grey)]",
                      "mb-4"
                    ]
                  },
                  ["Challenge a friend online. Create a game and share the link, or join an existing game."]
                )
              ]
            )
          ]
        ),
        
        createElement(
          "p",
          {
            class: [
              "text-[var(--light-grey)]",
              "text-center",
              "pb-1"
            ]
          },
          ["Select a game mode to continue"]
        )
      ]
    );
  },
});

export default GameSetup;