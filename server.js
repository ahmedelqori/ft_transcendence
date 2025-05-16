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
    await app.listen({ port: 1334, host: "0.0.0.0" });
    app.log.info(`WebSocket server available at ws://0.0.0.0:1334/ws`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
