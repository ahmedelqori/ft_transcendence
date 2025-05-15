import { PrismaClient } from '@prisma/client';
import fp from 'fastify-plugin';

const prisma = new PrismaClient();

async function dbConnector(fastify, options) {
  try {
    await prisma.$connect();
    fastify.decorate('prisma', prisma);
    fastify.log.info('Database connected');
  } catch (error) {
    fastify.log.error('Database connection error:', error);
    process.exit(1);
  }
}

export default fp(dbConnector);