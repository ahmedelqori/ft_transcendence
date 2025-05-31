import {
  createElement,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";

interface GamePausedOverlayProps {
  visible: boolean;
  onResume?: () => void;
}

export const GamePausedOverlay = defineComponent<void, GamePausedOverlayProps>({
  state() {},

  render(this: IComponent<void, GamePausedOverlayProps>) {
    const { visible, onResume } = this.props;    
    if (!visible)
      return createElement("div", { style: { display: "none" } });
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
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
                      fontWeight: "700",
                      marginBottom: "0.5rem",
                      color: "#ddf247",
                      textShadow: "0 0 5px rgba(221, 242, 71, 0.4)"
                    }
                  },
                  ["GAME"]
                ),
                createElement(
                  "h1",
                  {
                    style: {
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: "clamp(1.8rem, 5vw, 2.5rem)", 
                      fontWeight: "700",
                      marginBottom: "1rem",
                      color: "#ddf247",
                      textShadow: "0 0 5px rgba(221, 242, 71, 0.4)"
                    }
                  },
                  ["PAUSED"]
                )
              ]
            ),
            
            createElement(
              "button",
              {
                style: {
                  fontFamily: "'Poppins', sans-serif",
                  backgroundColor: "transparent",
                  color: "#ddf247",
                  border: "2px solid #ddf247",
                  padding: "clamp(8px, 2.5%, 12px) clamp(20px, 5%, 32px)",
                  borderRadius: "6px",
                  fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textShadow: "none",
                  outline: "none",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)"
                },
                on: {
                  click: () => {
                    if (onResume) onResume();
                  },
                  mouseover: (e: MouseEvent) => {
                    const target = e.target as HTMLElement;
                    if (target) {
                      target.style.backgroundColor = "rgba(221, 242, 71, 0.2)";
                    }
                  },
                  mouseout: (e: MouseEvent) => {
                    const target = e.target as HTMLElement;
                    if (target) {
                      target.style.backgroundColor = "transparent";
                    }
                  }
                }
              },
              ["RESUME"]
            )
          ]
        )
      ]
    );
  }
});

export default GamePausedOverlay;
