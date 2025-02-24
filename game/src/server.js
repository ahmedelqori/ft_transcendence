import Fastify from "fastify";
import { gameRoutes } from "./routes/routegame.js";

// import getAllGames from "./controllers/controller.game"

const fastify = Fastify(({
    logger: {
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        }
      }
    }
  }));

  fastify.register(gameRoutes, {prefix : "/api/games"})
  fastify.post('/user', {
  }, async (req, reply) => {
     reply.send({ age: req.body.age, name: req.body.name });
  });






const start = async function(){
  const port = process.env.PORT || 3000;
  try {
      await fastify.listen({port:port, host: "0.0.0.0"})
  } catch (error) {
      fastify.log.error(error);
      process.exit(1)
  }
}

start()