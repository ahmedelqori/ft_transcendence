import { authState } from "@/Hooks/Auth";
import enhancedFetch from "@/Hooks/fetch";
import { router } from "@/router/Router";
import { createElement, defineComponent, IComponent } from "@/uccello/Uccello";
function drawWinRateChart(canvasId: string, matches: any[], playerId: number) {
  const canvas: any = document.getElementById(canvasId);
  if (!canvas) return;

  const container = canvas.parentElement;
  const containerWidth = container.offsetWidth;
  const containerHeight = container.offsetHeight;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = containerWidth * dpr;
  canvas.height = containerHeight * dpr;
  canvas.style.width = "100%";
  canvas.style.height = "100%";

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, containerWidth, containerHeight);

  const playedMatches = matches.filter(
    (m) => m.playerOneId === playerId || m.playerTwoId === playerId
  );

  if (playedMatches.length === 0) {
    ctx.fillStyle = "#ccc";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      "No data available for this player",
      containerWidth / 2,
      containerHeight / 2
    );
    return;
  }

  const results = playedMatches.map((match) => {
    const isWinner = match.winnerId === playerId;
    return isWinner ? 100 : 0;
  });

  const paddingTop = 20;
  const paddingBottom = 30;
  const chartHeight = containerHeight - paddingTop - paddingBottom;
  const maxValue = 100;
  const stepX = results.length > 1 ? containerWidth / (results.length - 1) : 0;

  ctx.beginPath();
  ctx.strokeStyle = "#ddf247";
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  results.forEach((value, i) => {
    const x = i * stepX;
    const y =
      containerHeight - paddingBottom - (value / maxValue) * chartHeight;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      const prevValue = results[i - 1];
      const prevX = (i - 1) * stepX;
      const prevY =
        containerHeight - paddingBottom - (prevValue / maxValue) * chartHeight;
      const midX = (prevX + x) / 2;
      const midY = (prevY + y) / 2;

      ctx.quadraticCurveTo(prevX, prevY, midX, midY);
      if (i === results.length - 1) {
        ctx.quadraticCurveTo(midX, midY, x, y);
      }
    }
  });
  ctx.stroke();
}

let resizeTimeout: any;
function handleResize(matches: any[], playerId: number) {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    drawWinRateChart("progressChart", matches, playerId);
  }, 150);
}

interface ProgressChart {
  matches: any[];
}

const TournamentDashboard = defineComponent<ProgressChart>({
  state() {
    return { matches: [] };
  },
  async onMounted(
    this: IComponent<ProgressChart> & { getGames: () => Promise<void> }
  ) {
    await this.getGames();
  },
  render(this: IComponent<ProgressChart> & { getGames: () => Promise<void> }) {
    const playerId: number = authState.getState().user?.id!;

    setTimeout(() => {
      drawWinRateChart("progressChart", this.state.matches, playerId);
      window.removeEventListener("resize", () =>
        handleResize(this.state.matches, playerId)
      );
      window.addEventListener("resize", () =>
        handleResize(this.state.matches, playerId)
      );
    }, 100);

    return createElement(
      "div",
      {
        class: [
          "w-2/3",
          "min-w-[500px]",
          "h-full",
          "rounded-[30px]",
          "border-2",
          "border-[#878787]",
          "border-opacity-[30%]",
          "items-start",
          "px-2",
          "py-4",
          "gap-4",
          "relative",
        ],
      },
      [
        createElement("div", { class: ["p-4", "w-full", "h-[400px]"] }, [
          createElement("canvas", {
            id: "progressChart",
            class: ["w-full", "h-full"],
          }),
        ]),
      ]
    );
  },
  async getGames(
    this: IComponent<ProgressChart> & {
      getFriendInfo: (
        id: number
      ) => Promise<{ avatar: string; username: string }>;
    }
  ) {
    try {
      const response = await enhancedFetch.fetch(
        `${import.meta.env.VITE_URL_DEV}/api/games/user/${
          authState.getState().user?.id
        }`,
        {
          mode: "no-cors",
        }
      );
      const data = await response.json();
      if (this.getIsMounted)
      this.updateState({ matches: data.reverse() });
    } catch (err) {}
  },
});

export default TournamentDashboard;
