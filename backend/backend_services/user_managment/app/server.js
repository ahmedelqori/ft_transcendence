
import Fastify from 'fastify';
import pinoPretty from 'pino-pretty';
import routes from './routes.js';
import cookie from '@fastify/cookie';
import Knex from 'knex';
import knexConfig from './knexfile.cjs'; // Ensure the path is correct

import { Model } from 'objection';

// Initialize Knex with the configuration
const knex = Knex(knexConfig.development);

// Bind Knex to Objection.js
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


import Player from './models.js';


fastify.post('/players', async (request, reply) => {
  const { username, email, first_name, last_name, bio, avatar_url, status, two_FA } = request.body;

  try {
    const newPlayer = await Player.query().insert({
      username,
      email,
      first_name,
      last_name,
      bio,
      avatar_url,
      status,
      two_FA,
    });

    reply.send(newPlayer);
  } catch (err) {
    reply.status(400).send({ error: err.message });
  }
});



fastify.get('/players', async (request, reply) => {
  try {
    const players = await Player.query();
    reply.send(players);
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
});












fastify.register(routes, { prefix: '/api/account/' });
fastify.register(cookie);

// Run the server!
fastify.listen({ port: 3000}, function (err, address) {
    if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
})