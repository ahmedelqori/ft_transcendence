import {fastify} from '../server.js';
import fastifyPlugin from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';


export const prismaPlugin = async function(fastify, options) {
  fastify.log.info("Registering Prisma plugin");
  const prisma = new PrismaClient({
    log: ['error', 'warn']
  });
  await prisma.$connect();
  fastify.decorate('prisma', prisma);
  fastify.addHook('onClose', async (fastify) => {
    await prisma.$disconnect();
  });
};

export default fastifyPlugin(prismaPlugin);