import {
  createElement,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";

interface WaitingOpponentOverlayProps {
  visible: boolean;
  position?: string;
}

export const WaitingOpponentOverlay = defineComponent<void, WaitingOpponentOverlayProps>({
  state() {},

  render(this: IComponent<void, WaitingOpponentOverlayProps>) {
    const { visible, position } = this.props;    
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
                      fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
                      fontWeight: "700",
                      marginBottom: "0.5rem",
                      color: "#ddf247",
                      textShadow: "0 0 5px rgba(221, 242, 71, 0.4)"
                    }
                  },
                  ["WAITING FOR"]
                ),
                createElement(
                  "h1",
                  {
                    style: {
                      fontSize: "clamp(1.5rem, 5vw, 2.5rem)", 
                      fontWeight: "700",
                      marginBottom: "1rem",
                      color: "#ddf247",
                      textShadow: "0 0 5px rgba(221, 242, 71, 0.4)"
                    }
                  },
                  ["OPPONENT"]
                )
              ]
            ),
            
            createElement(
              "div",
              {
                style: {
                  display: "inline-block",
                  width: "clamp(30px, 8%, 50px)",
                  height: "clamp(30px, 8%, 50px)",
                  marginBottom: "clamp(10px, 1.5%, 12px)",
                  border: "3px solid rgba(221, 242, 71, 0.3)",
                  borderRadius: "50%",
                  borderTop: "3px solid #ddf247",
                  animation: "spin 1s linear infinite"
                }
              }
            ),
            
            createElement(
              "style",
              {},
              [`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `]
            ),
            
            createElement(
              "p",
              {
                style: {
                  fontSize: "clamp(0.9rem, 2.2vw, 1.1rem)",
                  color: "#ffffff",
                  textAlign: "center",
                  fontWeight: "500",
                  marginBottom: "clamp(6px, 1.5%, 12px)"
                }
              },
              [`You're the ${position} paddle`]
            ),
          ]
        )
      ]
    );
  }
});

export default WaitingOpponentOverlay;
