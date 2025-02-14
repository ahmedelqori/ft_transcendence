import Fastify from 'fastify'; // Backend Framework
import pinoPretty from 'pino-pretty'; // to make debug messages more readable and pretty(colors)
import routes from './routes.js'; // import routes
import cookie from '@fastify/cookie'; // cookies
import Knex from 'knex'; // query builder (translate js queries to sql queries)
import knexConfig from './knexfile.cjs'; // knex config
import { Model } from 'objection'; // ORM build on top of Knex 
import multipart from '@fastify/multipart'; // to handle file uploads

const knex = Knex(knexConfig);

Model.knex(knex);

const prettyStream = pinoPretty({
  colorize: true,
  ignore: 'pid,hostname,res,req,reqId,responseTime',
});

const fastify = Fastify({
  logger: {
    level: 'debug',
    stream: prettyStream,
  },
});

fastify.register(cookie);
fastify.register(multipart);
fastify.register(routes, { prefix: '/api/account/' });


// Run the server!
fastify.listen({ port: 3000 }, function (err, address) {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`Server listening at ${address}`);
});