import { createElement, defineComponent } from "@/uccello/Uccello.js";

const Welcome = defineComponent<void>({
  state() {},
  render() {
    return createElement(
      "main",
      { class: ["flex", "flex-row", "w-3/4", "m-auto"] },
      [
        createElement(
          "div",
          { class: ["items-start", "flex-1", "justify-center"] },
          [
            createElement(
              "h1",
              { class: ["text-7xl", "leading-snug", "font-medium", "w-3/4"] },
              ["Ping Pong Showdown: The Ultimate Battle for the Net!"]
            ),
            createElement(
              "h3",
              { class: ["text-base", "text-[var(--light-grey)]"] },
              [
                "Step into the ultimate ping pong experience where every serve sizzles and every rally heats up.",
              ]
            ),
          ]
        ),
        createElement("img", {
          src: "assets/bg-r.webp",
          class: [
            "flex-1",
            "z-10",
            "animate-pulse",
            "transition-all",
            "duration-[3000ms]",
            "ease-in-out",
            "brightness-125",
            "saturate-150",
            "drop-shadow-[0_0_400px_var(--light-yellow)]",
            "rounded-2xl",
          ],
        }),
      ]
    );
  },
});

export default Welcome;
