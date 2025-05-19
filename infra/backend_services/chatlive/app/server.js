import { buildApp } from "./socket/socket.js";
import sensible from "@fastify/sensible";
import dbPlugin from "./db.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = await buildApp();
app.register(sensible);
app.register(dbPlugin);

const start = async () => {
  try {
    await app.listen({ port: 3000, host: "127.0.0.1" });
    app.log.info(`WebSocket server available at ws://127.0.0.1:3000/ws`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
