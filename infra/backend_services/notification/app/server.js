import Fastify from "fastify";
import PinoPretty from "pino-pretty";
import knexConfig from './knexfile.cjs';
import routes from './routes.js'
import Knex from "knex";
import { Model } from "objection";
import ws from '@fastify/websocket';


const knex = Knex(knexConfig);

Model.knex(knex);

const prettyStream = PinoPretty({
    colorize: true,
    ignore: 'responseTime,reqId,res,req,pid,hostname',
  });


const fastify = Fastify({
  logger: {
    level: 'debug',
    stream: prettyStream,
  },
});

// fastify.setErrorHandler((error, request, reply) => {
//   reply.status(500).send({
//     statusCode: 500,
//     error: 'Internal Server Error',
//     message: 'Something went wrong',
//   });
// });

fastify.register(ws);
fastify.register(routes, {prefix: '/api/notif/'});

fastify.listen({port: 3000, host: '0.0.0.0'}, function (err, address){
    if (err){
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Server listening at ${address}`);
});

