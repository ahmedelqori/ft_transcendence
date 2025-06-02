import {
  createElement,
  defineComponent,
  type IComponent,
} from "@/uccello/Uccello.js";
import { router } from "@/router/Router.js";

interface VictoryOverlayProps {
  score: { player: number; opponent: number };
  visible?: boolean;
  gameState: any;
}

export const VictoryOverlay = defineComponent<void, VictoryOverlayProps>({
  state() {},

  render(this: IComponent<void, VictoryOverlayProps>) {
    const { score, visible = true, gameState } = this.props;

    if (!visible) {
      return createElement("div", { style: { display: "none" } });
    }

    if (gameState.tournamentId && gameState.tournamentId !== 0) {
      setTimeout(async () => {
        console.log(
          `============/tournament/${gameState.tournamentId}====================`
        );
        await router.navigateTo(`/tournament/${gameState.tournamentId}`);
      }, 500);
    }

    const handleGoToPage = async (link: string) => {
      await router.navigateTo(link);
    };

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
              border: "2px solid #ddf247",
              boxShadow:
                "0 15px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(221, 242, 71, 0.3)",
              background: "rgba(30, 30, 30, 0.75)",
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
                  color: "#ddf247",
                  marginBottom: "clamp(5px, 2%, 10px)",
                },
              },
              ["🏆"]
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
                      color: "#ddf247",
                      textShadow: "0 0 5px rgba(221, 242, 71, 0.4)",
                    },
                  },
                  ["VICTORY!"]
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
                  [`${score.player} - ${score.opponent}`]
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
                  margin: "0",
                },
              },
              ["Excellent play! Well done on your victory!"]
            ),
            createElement(
              "button",
              {
                style: {
                  fontFamily: "'Poppins', sans-serif",
                  backgroundColor: "#ddf247",
                  color: "#1e1e1e",
                  fontWeight: "bold",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  transition: "background-color 0.3s, transform 0.3s",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                  marginTop: "10px",
                  textAlign: "center",
                  display: "inline-block",
                  textDecoration: "none",
                  width: "100%",
                  maxWidth: "250px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  transform: "translateY(0)",
                },
                on: {
                  click: () => {
                    if (gameState.tournamentId && gameState.tournamentId != 0)
                      handleGoToPage(`/tournament/${gameState.tournamentId}`);
                    else handleGoToPage(`/dashboard`);
                  },
                },
              },
              [
                gameState.tournamentId && gameState.tournamentId != 0
                  ? "GO TO TOURNAMENT"
                  : "GO TO DASHBOARD",
              ]
            ),
          ]
        ),
      ]
    );
  },
});

export default VictoryOverlay;
