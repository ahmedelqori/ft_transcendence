import { createElement, defineComponent, IComponent } from "../../../uccello/Uccello.js";

interface CountdownOverlayProps {
  visible: boolean;
  countdown: number;
}

export const CountdownOverlay = defineComponent<void, CountdownOverlayProps>({
  state() {},

  render(this: IComponent<void, CountdownOverlayProps>) {
    const { visible, countdown } = this.props;
    
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
          backdropFilter: "blur(2px)",
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
              border: "2px solid #ddf247",
              boxShadow: "0 15px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(221, 242, 71, 0.3)",
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
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
                      fontWeight: "700",
                      marginBottom: "0.5rem",
                      color: "#ddf247",
                      textShadow: "0 0 5px rgba(221, 242, 71, 0.4)"
                    }
                  },
                  ["GAME STARTS IN"]
                ),
                createElement(
                  "div",
                  {
                    style: {
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "clamp(3.5rem, 8vw, 5rem)", 
                      fontWeight: "700",
                      marginTop: "1rem",
                      color: countdown === 1 ? "#56f2ff" : "#ffffff",
                      textShadow: countdown === 1 ? 
                        "0 0 8px rgba(86, 242, 255, 0.8)" : 
                        "0 0 8px rgba(221, 242, 71, 0.6)",
                      animation: "pulse 1s infinite",
                      letterSpacing: countdown === 1 ? "0.1em" : "normal"
                    }
                  },
                  [countdown === 1 ? "GO!" : `${countdown}`]
                )
              ]
            ),
            
            createElement(
              "style",
              {},
              [`
                @keyframes pulse {
                  0% { transform: scale(1); opacity: 1; }
                  50% { transform: scale(1.1); opacity: 0.9; }
                  100% { transform: scale(1); opacity: 1; }
                }
              `]
            ),
            
            createElement(
              "p",
              {
                style: {
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)",
                  fontWeight: "500",
                  color: "#ffffff",
                  textAlign: "center",
                  opacity: "0.9"
                }
              },
              [countdown === 1 ? "" : "Get Ready!"]
            )
          ]
        )
      ]
    );
  }
});

export default CountdownOverlay;
