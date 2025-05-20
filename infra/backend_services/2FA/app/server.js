import Fastify from 'fastify'; // Backend Framework
import pinoPretty from 'pino-pretty'; // to make debug messages more readable and pretty(colors)
import routes from './routes.js'; // import routes
import cookie from '@fastify/cookie'; // cookies
import Knex from 'knex'; // query builder (translate js queries to sql queries)
import knexConfig from './knexfile.cjs'; // knex config
import { Model } from 'objection'; // ORM build on top of Knex 
import multipart from '@fastify/multipart'; // to handle file uploads
import cors from '@fastify/cors'; // to handle CORS
import { loadSecrets } from './utils/vault-service.js'; 

export const secrets = await loadSecrets();

// import { getOrigin } from './utils/vault-service.js'; 
// export let origin = null;

// origin = await getOrigin();



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


fastify.register(cors, {
  credentials: true,
  origin: ["http://localhost:5500"],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
});

fastify.register(cookie);
fastify.register(multipart);
fastify.register(routes, { prefix: '/api/2fa/' });

// Run the server!
fastify.listen({ port: 3000, host: '0.0.0.0' }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address} --- Origin: ${secrets.ORIGIN_S2S}`);
  
  
});