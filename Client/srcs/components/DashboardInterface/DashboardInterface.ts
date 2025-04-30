import {
  createElement,
  defineComponent,
  IComponent,
} from "../../uccello/Uccello.js";

interface IDashboardInterface {
  isHovering: boolean;
  isPlayButtonVisible: boolean;
  rotateX: number;
  rotateY: number;
  perspective: number;
  transitionDuration: number;
  maxRotation: number;
  autoRotate: boolean;
  autoRotateSpeed: number;
  autoRotateTimer: any;
}

const DashboardInterface = defineComponent<IDashboardInterface>({
  state() {
    return {
      isHovering: false,
      isPlayButtonVisible: false,
      rotateX: 0,
      rotateY: 0,
      perspective: 1000,
      transitionDuration: 0.5,
      maxRotation: 3,
      autoRotate: true,
      autoRotateSpeed: 2,
      autoRotateTimer: null,
    };
  },

  handleMouseMove(this: IComponent<IDashboardInterface>, e: any) {
    if (!this.state.isHovering) return;

    const rect = e.currentTarget.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);

    this.updateState({ rotateY: x * this.state.maxRotation });
    this.updateState({ rotateX: -y * this.state.maxRotation });

    if (this.state.autoRotateTimer) {
      clearInterval(this.state.autoRotateTimer);
      this.updateState({ autoRotateTimer: null });
    }
  },

  handleMouseEnter(this: IComponent<IDashboardInterface>) {
    this.updateState({ isHovering: true });
  },

  handleMouseLeave(
    this: IComponent<IDashboardInterface> & { startAutoRotation: () => void }
  ) {
    this.updateState({ isHovering: false });
    this.updateState({ rotateX: 0 });
    this.updateState({ rotateY: 0 });

    if (this.state.autoRotate && !this.state.autoRotateTimer) {
      this.startAutoRotation();
    }
  },

  handleClick(
    this: IComponent<IDashboardInterface> & { startAutoRotation: () => void }
  ) {
    const newVisibility = !this.state.isPlayButtonVisible;
    this.updateState({ isPlayButtonVisible: newVisibility });

    if (newVisibility && this.state.autoRotateTimer) {
      clearInterval(this.state.autoRotateTimer);
      this.updateState({ autoRotateTimer: null });
    } else if (!newVisibility && this.state.autoRotate) {
      this.startAutoRotation();
    }

    console.log("Banner visibility toggled:", newVisibility);
  },

  startAutoRotation(this: IComponent<IDashboardInterface>) {
    let angle = 0;
    this.state.autoRotateTimer = setInterval(() => {
      angle += 0.05 * this.state.autoRotateSpeed;
      this.updateState({ rotateY: Math.sin(angle) * this.state.maxRotation });
      this.updateState({
        rotateX: (Math.cos(angle) * this.state.maxRotation) / 2,
      });
    }, 30);
  },

  onMounted(
    this: IComponent<IDashboardInterface> & { startAutoRotation: () => void }
  ) {
    if (this.state.autoRotate) {
      this.startAutoRotation();
    }
  },

  onUnmounted(this: IComponent<IDashboardInterface>) {
    if (this.state.autoRotateTimer) {
      clearInterval(this.state.autoRotateTimer);
    }
  },

  render(
    this: IComponent<IDashboardInterface> & {
      startAutoRotation: () => void;
      handleMouseLeave: () => void;
      handleMouseEnter: () => void;
      handleMouseMove: () => void;
      handleClick: () => void;
    }
  ) {
    const rotateStyle = `
      perspective(${this.state.perspective}px)
      rotateX(${this.state.rotateX}deg)
      rotateY(${this.state.rotateY}deg)
      scale3d(1.05, 1.05, 1.05)
    `;

    return createElement(
      "section",
      {
        class: [
          "z-10",
          "mt-10",
          "w-full",
          "flex",
          "items-start",
          "justify-start",
        ],
      },
      [
        createElement(
          "div",
          {
            class: ["relative", "ml-[10%]", "w-fit", "rounded-[30px]"],
            onMousemove: this.handleMouseMove.bind(this),
            onMouseenter: this.handleMouseEnter.bind(this),
            onMouseleave: this.handleMouseLeave.bind(this),
            onClick: this.handleClick.bind(this),
            style: {
              transformStyle: "preserve-3d",
              transition: `transform ${this.state.transitionDuration}s ease-out`,
              transform: rotateStyle,
              boxShadow: `
                ${-this.state.rotateY}px ${
                this.state.rotateX
              }px 20px rgba(0,0,0,0.2),
                0 10px 20px rgba(0,0,0,0.1)
              `,
              cursor: "pointer",
            },
          },
          [
            createElement("img", {
              src: "../../public/assets/vector_3.png",
              class: ["rounded-[30px]", "w-[700px]", "z-10", "relative"],
              style: {
                filter: `brightness(${
                  100 +
                  Math.abs(this.state.rotateY) +
                  Math.abs(this.state.rotateX)
                }%)`,
              },
            }),

            createElement("div", {
              class: [
                "absolute",
                "top-0",
                "left-0",
                "w-4",
                "h-4",
                "border-t-2",
                "border-l-2",
                "border-[var(--light-yellow)]",
                "rounded-tl-[30px]",
              ],
              style: {
                transform: "translateZ(5px)",
                opacity: `${
                  0.8 +
                  (Math.abs(this.state.rotateY) +
                    Math.abs(this.state.rotateX)) /
                    100
                }`,
              },
            }),

            createElement("div", {
              class: [
                "absolute",
                "top-0",
                "right-0",
                "w-4",
                "h-4",
                "border-t-2",
                "border-r-2",
                "border-[var(--light-yellow)]",
                "rounded-tr-[30px]",
              ],
              style: {
                transform: "translateZ(5px)",
                opacity: `${
                  0.8 +
                  (Math.abs(this.state.rotateY) +
                    Math.abs(this.state.rotateX)) /
                    100
                }`,
              },
            }),

            createElement("div", {
              class: [
                "absolute",
                "bottom-0",
                "left-0",
                "w-4",
                "h-4",
                "border-b-2",
                "border-l-2",
                "border-[var(--light-yellow)]",
                "rounded-bl-[30px]",
              ],
              style: {
                transform: "translateZ(5px)",
                opacity: `${
                  0.8 +
                  (Math.abs(this.state.rotateY) +
                    Math.abs(this.state.rotateX)) /
                    100
                }`,
              },
            }),

            createElement("div", {
              class: [
                "absolute",
                "bottom-0",
                "right-0",
                "w-4",
                "h-4",
                "border-b-2",
                "border-r-2",
                "border-[var(--light-yellow)]",
                "rounded-br-[30px]",
              ],
              style: {
                transform: "translateZ(5px)",
                opacity: `${
                  0.8 +
                  (Math.abs(this.state.rotateY) +
                    Math.abs(this.state.rotateX)) /
                    100
                }`,
              },
            }),

            createElement("div", {
              class: ["absolute", "inset-0", "rounded-[30px]"],
              style: {
                background: `linear-gradient(
                  ${135 + this.state.rotateY}deg,
                  rgba(255, 255, 255, 0) 0%,
                  rgba(255, 255, 255, ${
                    0.1 + Math.abs(this.state.rotateY) / 100
                  }) 50%,
                  rgba(255, 255, 255, 0) 100%
                )`,
                pointerEvents: "none",
                zIndex: "20",
              },
            }),

            createElement(
              "div",
              {
                class: [
                  "absolute",
                  "z-30",
                  "flex",
                  "items-center",
                  "justify-center",
                  "inset-0",
                  "bg-black",
                  "bg-opacity-40",
                  "rounded-[30px]",
                ],
                style: {
                  transform: "translateZ(10px)",
                  opacity: this.state.isPlayButtonVisible ? "1" : "0",
                  visibility: this.state.isPlayButtonVisible
                    ? "visible"
                    : "hidden",
                  transition: "opacity 0.5s ease-out, visibility 0.5s ease-out",
                },
              },
              [
                // Rotating "Play Now" text
                createElement(
                  "div",
                  {
                    class: [
                      "relative",
                      "w-[300px]",
                      "h-[300px]",
                      "flex",
                      "items-center",
                      "justify-center",
                    ],
                    style: {
                      transform: this.state.isPlayButtonVisible
                        ? "rotate(0deg) scale(1)"
                        : "rotate(-90deg) scale(0.5)",
                      opacity: this.state.isPlayButtonVisible ? "1" : "0",
                      transition:
                        "transform 0.8s ease-out, opacity 0.8s ease-out",
                      transformOrigin: "center",
                    },
                  },
                  [
                    createElement(
                      "div",
                      {
                        class: [
                          "bg-gradient-to-r",
                          "from-yellow-400",
                          "to-yellow-600",
                          "text-white",
                          "font-bold",
                          "text-4xl",
                          "py-4",
                          "px-8",
                          "rounded-lg",
                          "shadow-lg",
                        ],
                        style: {
                          transform: "rotate(45deg)",
                          animation: this.state.isPlayButtonVisible
                            ? "pulse 1.5s infinite"
                            : "none",
                          transformOrigin: "center",
                        },
                      },
                      ["PLAY NOW"]
                    ),
                  ]
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
