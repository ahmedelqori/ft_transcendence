import { authState } from "@/Hooks/Auth";
import enhancedFetch from "@/Hooks/fetch";
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

    const opponentScore =
      playerId === match.playerOneId
        ? match.playerTwoScore
        : match.playerOneScore;
    const playerScore =
      playerId === match.playerOneId
        ? match.playerOneScore
        : match.playerTwoScore;

    const total = playerScore + opponentScore;
    const percentage = total === 0 ? 50 : (playerScore / total) * 100;

    return {
      value: percentage,
      startedAt: match.startedAt ? new Date(match.startedAt) : new Date(),
      score: `${playerScore}-${opponentScore}`,
    };
  });

  const paddingTop = 30;
  const paddingBottom = 50;
  const paddingLeft = 60;
  const paddingRight = 20;
  const chartHeight = containerHeight - paddingTop - paddingBottom;
  const chartWidth = containerWidth - paddingLeft - paddingRight;

  const stepX = results.length > 1 ? chartWidth / (results.length - 1) : 0;

  // Calculate points
  const points = results.map((res, i) => ({
    x: paddingLeft + i * stepX,
    y: containerHeight - paddingBottom - (res.value / 100) * chartHeight,
  }));

  // Draw Axes
  ctx.strokeStyle = "#878787";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(paddingLeft, paddingTop);
  ctx.lineTo(paddingLeft, containerHeight - paddingBottom); // Y axis
  ctx.lineTo(containerWidth - paddingRight, containerHeight - paddingBottom); // X axis
  ctx.stroke();

  // Y-Axis Labels
  ctx.fillStyle = "#878787";
  ctx.font = "14px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("100%", paddingLeft - 10, paddingTop + 5);
  ctx.fillText("0%", paddingLeft - 10, containerHeight - paddingBottom + 5);

  // X-Axis Time Label Format
  const firstDate = results[0].startedAt;
  const lastDate = results[results.length - 1].startedAt;
  const diffMs = lastDate.getTime() - firstDate.getTime();
  let timeFormat = "minute";

  if (diffMs > 30 * 24 * 60 * 60 * 1000) timeFormat = "month";
  else if (diffMs > 24 * 60 * 60 * 1000) timeFormat = "day";
  else if (diffMs > 60 * 60 * 1000) timeFormat = "hour";

  function formatTime(date: Date) {
    if (timeFormat === "month")
      return date.toLocaleDateString("en", { month: "short" });
    if (timeFormat === "day")
      return date.toLocaleDateString("en", { day: "numeric", month: "short" });
    if (timeFormat === "hour")
      return date.toLocaleTimeString("en", { hour: "2-digit", hour12: false });
    return date.toLocaleTimeString("en", {
      minute: "2-digit",
      hour: "2-digit",
      hour12: false,
    });
  }

  ctx.textAlign = "center";
  ctx.fillStyle = "#878787";
  results.forEach((res, i) => {
    const x = paddingLeft + i * stepX;
    ctx.fillText(
      formatTime(res.startedAt),
      x,
      containerHeight - paddingBottom + 20
    );
  });

  // Draw smooth curve that passes through all points
  if (points.length > 1) {
    ctx.beginPath();
    ctx.strokeStyle = "#ddf247";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.moveTo(points[0].x, points[0].y);

    if (points.length === 2) {
      // Just two points, draw a line
      ctx.lineTo(points[1].x, points[1].y);
    } else {
      // Multiple points, create smooth curve
      for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];

        if (i === 0) {
          // First segment
          const afterNext = points[i + 2] || next;
          const cp1x = current.x + (next.x - current.x) * 0.3;
          const cp1y = current.y + (next.y - current.y) * 0.3;
          const cp2x = next.x - (afterNext.x - current.x) * 0.2;
          const cp2y = next.y - (afterNext.y - current.y) * 0.2;

          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
        } else if (i === points.length - 2) {
          // Last segment
          const prev = points[i - 1];
          const cp1x = current.x + (next.x - prev.x) * 0.2;
          const cp1y = current.y + (next.y - prev.y) * 0.2;
          const cp2x = next.x - (next.x - current.x) * 0.3;
          const cp2y = next.y - (next.y - current.y) * 0.3;

          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
        } else {
          // Middle segments
          const prev = points[i - 1];
          const afterNext = points[i + 2];
          const cp1x = current.x + (next.x - prev.x) * 0.2;
          const cp1y = current.y + (next.y - prev.y) * 0.2;
          const cp2x = next.x - (afterNext.x - current.x) * 0.2;
          const cp2y = next.y - (afterNext.y - current.y) * 0.2;

          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
        }
      }
    }

    ctx.stroke();
  }

  // Draw Score Points
  results.forEach((res, i) => {
    const x = paddingLeft + i * stepX;
    const y = containerHeight - paddingBottom - (res.value / 100) * chartHeight;

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#ddf247";
    ctx.fill();

    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(res.score, x, y - 10);
  });
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
      if (this.getIsMounted) this.updateState({ matches: data.reverse() });
    } catch (err) {}
  },
});

export default TournamentDashboard;
