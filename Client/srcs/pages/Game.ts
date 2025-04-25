// import {
//   createElement,
//   defineComponent,
//   IComponent,
// } from "../uccello/Uccello.js";

// const Game = defineComponent({
//   onMounted(this: IComponent<any>) {
//     // Get the canvas element
//     const canvas = this.getHtmlElement;
//     const ctx = canvas.getContext("2d");

//     // Set fixed dimensions for canvas - we'll make this responsive later
//     canvas.width = 800;
//     canvas.height = 400;

//     // Game objects
//     const ball = {
//       x: canvas.width / 2,
//       y: canvas.height / 2,
//       radius: 10,
//       speedX: 5,
//       speedY: 5,
//       color: "#fcd34d",
//     };

//     const paddleHeight = 80;
//     const paddleWidth = 10;

//     const leftPaddle = {
//       x: 20,
//       y: canvas.height / 2 - paddleHeight / 2,
//       width: paddleWidth,
//       height: paddleHeight,
//       color: "#ddf247",
//       score: 0,
//       isMovingUp: false,
//       isMovingDown: false,
//     };

//     const rightPaddle = {
//       x: canvas.width - 20 - paddleWidth,
//       y: canvas.height / 2 - paddleHeight / 2,
//       width: paddleWidth,
//       height: paddleHeight,
//       color: "#ffffff",
//       score: 0,
//       isMovingUp: false,
//       isMovingDown: false,
//     };

//     // Keyboard controls
//     document.addEventListener("keydown", (e) => {
//       if (e.key === "w") leftPaddle.isMovingUp = true;
//       if (e.key === "s") leftPaddle.isMovingDown = true;
//       if (e.key === "ArrowUp") rightPaddle.isMovingUp = true;
//       if (e.key === "ArrowDown") rightPaddle.isMovingDown = true;
//     });

//     document.addEventListener("keyup", (e) => {
//       if (e.key === "w") leftPaddle.isMovingUp = false;
//       if (e.key === "s") leftPaddle.isMovingDown = false;
//       if (e.key === "ArrowUp") rightPaddle.isMovingUp = false;
//       if (e.key === "ArrowDown") rightPaddle.isMovingDown = false;
//     });

//     // Basic touch controls for mobile
//     canvas.addEventListener("touchstart", (e: any) => {
//       e.preventDefault();
//       const touch = e.touches[0];
//       const rect = canvas.getBoundingClientRect();
//       const touchX = touch.clientX - rect.left;

//       // Use left half of screen for left paddle, right half for right paddle
//       if (touchX < canvas.width / 2) {
//         leftPaddle.isMovingUp = touch.clientY < canvas.height / 2;
//         leftPaddle.isMovingDown = touch.clientY >= canvas.height / 2;
//       } else {
//         rightPaddle.isMovingUp = touch.clientY < canvas.height / 2;
//         rightPaddle.isMovingDown = touch.clientY >= canvas.height / 2;
//       }
//     });

//     canvas.addEventListener("touchend", (e: any) => {
//       e.preventDefault();
//       leftPaddle.isMovingUp = false;
//       leftPaddle.isMovingDown = false;
//       rightPaddle.isMovingUp = false;
//       rightPaddle.isMovingDown = false;
//     });

//     // Game functions
//     function resetBall() {
//       ball.x = canvas.width / 2;
//       ball.y = canvas.height / 2;
//       ball.speedX = ball.speedX > 0 ? -5 : 5;
//       ball.speedY = Math.random() * 6 - 3;
//     }

//     function checkCollision() {
//       // Wall collision (top and bottom)
//       if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
//         ball.speedY = -ball.speedY;
//       }

//       // Left paddle collision
//       if (
//         ball.x - ball.radius <= leftPaddle.x + leftPaddle.width &&
//         ball.y >= leftPaddle.y &&
//         ball.y <= leftPaddle.y + leftPaddle.height &&
//         ball.speedX < 0
//       ) {
//         ball.speedX = -ball.speedX;
//         const hitPosition = (ball.y - leftPaddle.y) / leftPaddle.height;
//         ball.speedY = 10 * (hitPosition - 0.5);
//       }

//       // Right paddle collision
//       if (
//         ball.x + ball.radius >= rightPaddle.x &&
//         ball.y >= rightPaddle.y &&
//         ball.y <= rightPaddle.y + rightPaddle.height &&
//         ball.speedX > 0
//       ) {
//         ball.speedX = -ball.speedX;
//         const hitPosition = (ball.y - rightPaddle.y) / rightPaddle.height;
//         ball.speedY = 10 * (hitPosition - 0.5);
//       }

//       // Score points
//       if (ball.x - ball.radius <= 0) {
//         rightPaddle.score++;
//         resetBall();
//       } else if (ball.x + ball.radius >= canvas.width) {
//         leftPaddle.score++;
//         resetBall();
//       }
//     }

//     function update() {
//       // Move paddles
//       if (leftPaddle.isMovingUp && leftPaddle.y > 0) {
//         leftPaddle.y -= 8;
//       }
//       if (
//         leftPaddle.isMovingDown &&
//         leftPaddle.y < canvas.height - leftPaddle.height
//       ) {
//         leftPaddle.y += 8;
//       }

//       if (rightPaddle.isMovingUp && rightPaddle.y > 0) {
//         rightPaddle.y -= 8;
//       }
//       if (
//         rightPaddle.isMovingDown &&
//         rightPaddle.y < canvas.height - rightPaddle.height
//       ) {
//         rightPaddle.y += 8;
//       }

//       // Move ball
//       ball.x += ball.speedX;
//       ball.y += ball.speedY;

//       // Check collisions
//       checkCollision();
//     }

//     function draw() {
//       // Clear canvas with dark background
//       ctx.fillStyle = "#1e293b";
//       ctx.fillRect(0, 0, canvas.width, canvas.height);

//       // Draw middle line
//       ctx.beginPath();
//       ctx.setLineDash([10, 10]);
//       ctx.moveTo(canvas.width / 2, 0);
//       ctx.lineTo(canvas.width / 2, canvas.height);
//       ctx.strokeStyle = "#94a3b8";
//       ctx.stroke();
//       ctx.setLineDash([]);

//       // Draw ball
//       ctx.beginPath();
//       ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
//       ctx.fillStyle = ball.color;
//       ctx.fill();

//       // Draw paddles
//       ctx.fillStyle = leftPaddle.color;
//       ctx.fillRect(
//         leftPaddle.x,
//         leftPaddle.y,
//         leftPaddle.width,
//         leftPaddle.height
//       );

//       ctx.fillStyle = rightPaddle.color;
//       ctx.fillRect(
//         rightPaddle.x,
//         rightPaddle.y,
//         rightPaddle.width,
//         rightPaddle.height
//       );

//       // Draw scores
//       ctx.fillStyle = "#ffffff";
//       ctx.font = "30px Arial";
//       ctx.textAlign = "center";
//       ctx.fillText(leftPaddle.score.toString(), canvas.width / 4, 50);
//       ctx.fillText(rightPaddle.score.toString(), (3 * canvas.width) / 4, 50);

//       // Draw mobile instructions
//       if (window.innerWidth < 768) {
//         ctx.font = "16px Arial";
//         ctx.fillText(
//           "Touch top/bottom of screen to move paddles",
//           canvas.width / 2,
//           canvas.height - 20
//         );
//       }
//     }

//     // Game loop
//     function gameLoop() {
//       update();
//       draw();
//       requestAnimationFrame(gameLoop);
//     }

//     // Start with an initial draw
//     draw();

//     // Start the game loop
//     gameLoop();

//     // Log to confirm the game is running
//     console.log(
//       "Pong game initialized with canvas size:",
//       canvas.width,
//       "x",
//       canvas.height
//     );
//   },

//   state() {
//     return {};
//   },

//   render() {
//     return createElement("canvas", {
//       id: "pongCanvas",
//       class: [
//         "block",
//         "border-4",
//         "border-blue-500",
//         "rounded-lg",
//         "bg-slate-800",
//         "mx-auto",
//         "touch-none",
//       ],
//       style: {
//         display: "block",
//         width: "100%",
//         "max-width": "800px",
//         height: " 400px",
//       },
//     });
//   },
// });

// export default Game;

// client.js
import { router } from "../router/Router.js";
import {
  createElement,
  defineComponent,
  IComponent,
} from "../uccello/Uccello.js";

const Game = defineComponent({
  onMounted(this: IComponent<any>) {
    document.title = "Game";
    // WebSocket connection
    const socket = new WebSocket("ws://localhost:3003");
    let gameState: any = null;

    // Get the canvas element
    const canvas = this.getHtmlElement;
    const ctx = canvas.getContext("2d");

    // Set fixed dimensions for canvas
    canvas.width = 800;
    canvas.height = 400;

    socket.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    socket.onmessage = (event) => {
      // console.log("Hello");
      gameState = JSON.parse(event.data);
      draw();
    };

    socket.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // Send control inputs to server
    function sendControl(paddle: any, up: any, down: any) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "control",
            paddle: paddle,
            up: up,
            down: down,
          })
        );
      }
    }

    // Keyboard controls - only send state changes to server
    document.addEventListener("keydown", (e) => {
      if (e.key === "w") sendControl("left", true, false);
      if (e.key === "s") sendControl("left", false, true);
      if (e.key === "ArrowUp") sendControl("right", true, false);
      if (e.key === "ArrowDown") sendControl("right", false, true);
    });

    document.addEventListener("keyup", (e) => {
      if (e.key === "w") sendControl("left", false, false);
      if (e.key === "s") sendControl("left", false, false);
      if (e.key === "ArrowUp") sendControl("right", false, false);
      if (e.key === "ArrowDown") sendControl("right", false, false);
    });

    // Touch controls - send state changes to server
    canvas.addEventListener("touchstart", (e: any) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;

      if (touchX < canvas.width / 2) {
        sendControl(
          "left",
          touchY < canvas.height / 2,
          touchY >= canvas.height / 2
        );
      } else {
        sendControl(
          "right",
          touchY < canvas.height / 2,
          touchY >= canvas.height / 2
        );
      }
    });

    canvas.addEventListener("touchend", (e: any) => {
      e.preventDefault();
      sendControl("left", false, false);
      sendControl("right", false, false);
    });

    // Pure rendering function - no game logic here
    function draw() {
      if (!gameState) return;

      // Clear canvas with dark background
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw middle line
      ctx.beginPath();
      ctx.setLineDash([10, 10]);
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.strokeStyle = "#94a3b8";
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw ball
      ctx.beginPath();
      ctx.arc(
        gameState.ball.x,
        gameState.ball.y,
        gameState.ball.radius,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = gameState.ball.color;
      ctx.fill();

      // Draw paddles
      ctx.fillStyle = gameState.leftPaddle.color;
      ctx.fillRect(
        gameState.leftPaddle.x,
        gameState.leftPaddle.y,
        gameState.leftPaddle.width,
        gameState.leftPaddle.height
      );

      ctx.fillStyle = gameState.rightPaddle.color;
      ctx.fillRect(
        gameState.rightPaddle.x,
        gameState.rightPaddle.y,
        gameState.rightPaddle.width,
        gameState.rightPaddle.height
      );

      // Draw scores
      ctx.fillStyle = "#ffffff";
      ctx.font = "30px Arial";
      ctx.textAlign = "center";
      ctx.fillText(gameState.leftPaddle.score.toString(), canvas.width / 4, 50);
      ctx.fillText(
        gameState.rightPaddle.score.toString(),
        (3 * canvas.width) / 4,
        50
      );

      // Draw FPS counter
      ctx.font = "16px Arial";
      ctx.textAlign = "right";
      ctx.fillText(`FPS: ${gameState.fps}`, canvas.width - 10, 20);

      // Draw mobile instructions
      if (window.innerWidth < 768) {
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
          "Touch top/bottom of screen to move paddles",
          canvas.width / 2,
          canvas.height - 20
        );
      }
    }
  },

  state() {
    return {};
  },

  render() {
    return createElement("canvas", {
      id: "pongCanvas",
      class: [
        "block",
        "border-4",
        "border-blue-500",
        "rounded-lg",
        "bg-slate-800",
        "mx-auto",
        "touch-none",
      ],
      style: {
        display: "block",
        width: "100%",
        "max-width": "800px",
        height: "400px",
      },
    });
  },
});

export default Game;
