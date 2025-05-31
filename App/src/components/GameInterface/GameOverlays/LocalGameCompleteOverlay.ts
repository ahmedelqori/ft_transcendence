import {
  createElement,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";
import { router } from "@/router/Router.js";

interface LocalGameCompleteOverlayProps {
  visible: boolean;
  score: {
    player: number;
    opponent: number;
  };
  winner: "player" | "friend";
  playerName?: string;
  onReplay: () => void;
  onGoToDashboard: () => void;
}

export const LocalGameCompleteOverlay = defineComponent<void, LocalGameCompleteOverlayProps>({
  state() {},
  render(this: IComponent<void, LocalGameCompleteOverlayProps>) {
    const { visible, score, winner, playerName, onReplay, onGoToDashboard } = this.props;
    
    if (!visible)
      return createElement("div", { style: { display: "none" } });
    const overlayColor = "#ddf247";
    const winnerDisplayName = winner === "player" ? (playerName || "You") : "Your Friend";
    const winnerText = `${winnerDisplayName.toUpperCase()} WIN${winner === "player" ? "" : "S"}!`;
    const neutralIcon = "🏆";
    const neutralMessage = "Good game! Ready for another round?";
    return createElement(
      "div",
      {
        style: {
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          zIndex: "100",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          maxHeight: "100%",
          maxWidth: "100%",
        },
      },
      [
        createElement(
          "div",
          {
            style: {
              border: `2px solid ${overlayColor}`,
              boxShadow: `0 15px 30px rgba(0, 0, 0, 0.4), 0 0 20px ${overlayColor}40`,
              background: "rgba(30, 30, 30, 0.85)",
              borderRadius: "16px",
              padding: "clamp(20px, 5%, 50px) clamp(20px, 6%, 60px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "clamp(15px, 4%, 28px)",
              width: "clamp(350px, 60%, 500px)",
              maxWidth: "90%",
              transform: "translateY(-10px)",
            },
          },
          [
            createElement(
              "div",
              {
                style: {
                  fontSize: "clamp(30px, 8vw, 50px)",
                  color: overlayColor,
                  marginBottom: "clamp(5px, 2%, 10px)",
                },
              },
              [neutralIcon]
            ),
            createElement(
              "div",
              {
                style: {
                  textAlign: "center",
                },
              },
              [
                createElement(
                  "h1",
                  {
                    style: {
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
                      fontWeight: "700",
                      marginBottom: "0.5rem",
                      color: overlayColor,
                      textShadow: `0 0 5px ${overlayColor}60`,
                    },
                  },
                  [winnerText]
                ),
                createElement(
                  "p",
                  {
                    style: {
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "clamp(1rem, 3vw, 1.2rem)",
                      fontWeight: "500",
                      color: "#ffffff",
                      marginTop: "5px",
                      marginBottom: "10px",
                    },
                  },
                  [`Final Score: ${score.player} - ${score.opponent}`]
                ),
              ]
            ),
            createElement(
              "p",
              {
                style: {
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "clamp(0.8rem, 2vw, 1rem)",
                  color: "#ffffff",
                  textAlign: "center",
                  opacity: "0.8",
                  maxWidth: "clamp(250px, 80%, 280px)",
                  margin: "0 0 clamp(10px, 3%, 20px) 0",
                },
              },
              [neutralMessage]
            ),
            createElement(
              "div",
              {
                style: {
                  display: "flex",
                  gap: "15px",
                  width: "100%",
                  maxWidth: "280px",
                  flexDirection: "column",
                },
              },
              [
                createElement(
                  "button",
                  {
                    style: {
                      fontFamily: "'Poppins', sans-serif",
                      backgroundColor: overlayColor,
                      color: "#1e1e1e",
                      fontWeight: "bold",
                      padding: "12px 24px",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1rem",
                      transition: "all 0.3s",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                      textAlign: "center",
                      width: "100%",
                      transform: "translateY(0)",
                    },
                    on: {
                      click: () => {
                        onReplay();
                      },
                      mouseover: (e: MouseEvent) => {
                        const target = e.target as HTMLElement;
                        if (target) {
                          target.style.transform = "translateY(-2px)";
                          target.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.3)";
                        }
                      },
                      mouseout: (e: MouseEvent) => {
                        const target = e.target as HTMLElement;
                        if (target) {
                          target.style.transform = "translateY(0)";
                          target.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
                        }
                      },
                    },
                  },
                  ["🔄 PLAY AGAIN"]
                ),
                createElement(
                  "button",
                  {
                    style: {
                      fontFamily: "'Poppins', sans-serif",
                      backgroundColor: "transparent",
                      color: "#ffffff",
                      fontWeight: "bold",
                      padding: "12px 24px",
                      borderRadius: "8px",
                      border: "2px solid #666666",
                      cursor: "pointer",
                      fontSize: "1rem",
                      transition: "all 0.3s",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                      textAlign: "center",
                      width: "100%",
                      transform: "translateY(0)",
                    },
                    on: {
                      click: () => {
                        onGoToDashboard();
                      },
                      mouseover: (e: MouseEvent) => {
                        const target = e.target as HTMLElement;
                        if (target) {
                          target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                          target.style.borderColor = "#ffffff";
                          target.style.transform = "translateY(-2px)";
                        }
                      },
                      mouseout: (e: MouseEvent) => {
                        const target = e.target as HTMLElement;
                        if (target) {
                          target.style.backgroundColor = "transparent";
                          target.style.borderColor = "#666666";
                          target.style.transform = "translateY(0)";
                        }
                      },
                    },
                  },
                  ["📊 DASHBOARD"]
                ),
              ]
            ),
          ]
        ),
      ]
    );
  },
});

export default LocalGameCompleteOverlay;