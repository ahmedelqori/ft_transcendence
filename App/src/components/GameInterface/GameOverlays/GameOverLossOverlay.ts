import {
  createElement,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";

interface GameOverLossOverlayProps {
  visible: boolean;
  score: {
    player: number;
    opponent: number;
  };
}

export const GameOverLossOverlay = defineComponent<void, GameOverLossOverlayProps>({
  state() {},

  render(this: IComponent<void, GameOverLossOverlayProps>) {
    const { visible, score } = this.props;
    
    if (!visible) {
      return createElement("div", { style: { display: "none" } });
    }

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
          maxWidth: "100%"
        }
      },
      [
        createElement(
          "div",
          {
            style: {
              border: "2px solid #ff4242",
              boxShadow: "0 15px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 66, 66, 0.3)",
              background: "rgba(30, 30, 30, 0.75)",
              borderRadius: "16px",
              padding: "clamp(20px, 5%, 50px) clamp(20px, 6%, 60px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "clamp(15px, 4%, 28px)",
              width: "clamp(280px, 50%, 400px)",
              maxWidth: "90%",
              transform: "translateY(-10px)"
            }
          },
          [
            // Loss icon
            createElement(
              "div",
              {
                style: {
                  fontSize: "clamp(30px, 8vw, 50px)",
                  color: "#ff4242",
                  marginBottom: "clamp(5px, 2%, 10px)"
                }
              },
              ["😢"]
            ),
            
            // Defeat text
            createElement(
              "div",
              {
                style: {
                  textAlign: "center"
                }
              },
              [
                createElement(
                  "h1",
                  {
                    style: {
                      fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
                      fontWeight: "700",
                      marginBottom: "0.5rem",
                      color: "#ff4242",
                      textShadow: "0 0 5px rgba(255, 66, 66, 0.4)"
                    }
                  },
                  ["DEFEAT"]
                ),
                createElement(
                  "p",
                  {
                    style: {
                      fontSize: "clamp(1rem, 3vw, 1.2rem)",
                      fontWeight: "500",
                      color: "#ffffff",
                      marginTop: "5px",
                      marginBottom: "10px"
                    }
                  },
                  [`${score.player} - ${score.opponent}`]
                )
              ]
            ),
            
            // Motivational message
            createElement(
              "p",
              {
                style: {
                  fontSize: "clamp(0.8rem, 2vw, 1rem)",
                  color: "#ffffff",
                  textAlign: "center",
                  opacity: "0.8",
                  maxWidth: "clamp(250px, 80%, 280px)",
                  margin: "0"
                }
              },
              ["Better luck next time. Practice makes perfect!"]
            )
          ]
        )
      ]
    );
  }
});

export default GameOverLossOverlay;
