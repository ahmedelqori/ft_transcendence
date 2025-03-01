import prismaPlugin from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prismaPlugin(async function (fastify, options) {
  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async (instance) => {
    await prisma.$disconnect();
  });
});
