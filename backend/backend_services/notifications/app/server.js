import Fastify from "fastify";
import PinoPretty from "pino-pretty";
import knexConfig from './knexfile.cjs';
import routes from './routes.js'
import Knex from "knex";
import { Model } from "objection";


const knex = Knex(knexConfig);

Model.knex(knex);

const prettyStream = PinoPretty({
    colorize: true,
    ignore: 'pid,hostname,res,req,reqId,responseTime',
  });


const fastify = Fastify({
  logger: {
    level: 'debug',
    stream: prettyStream,
  },
});

fastify.register(routes);

fastify.listen({port: 3003, host: '127.0.0.1'}, function (err, address){
    if (err){
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Server listening at ${address}`);
});

