import Fastify from "fastify";
import PinoPretty from "pino-pretty";
import knexConfig from './knexfile.cjs';
import routes from './routes.js'
import Knex from "knex";
import { Model } from "objection";
import ws from '@fastify/websocket';
import cors from '@fastify/cors'; // to handle CORS

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

fastify.register(cors, {
  credentials: true,
  origin: ["http://localhost:5500"],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
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

fastify.addHook('onRequest', (request, reply, done) => {
  // Log all headers
  fastify.log.info('📨 Incoming Request Headers:', request.headers);
  
  // Continue processing the request
  done();
});

fastify.listen({port: 3000, host: '0.0.0.0'}, function (err, address){
    if (err){
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Server listening at ${address}`);
});

