// async function userRoutes(fastify, options) {
//   fastify.post('/', async (request, reply) => {
//     const { id } = request.body;
    
//     if (!id || typeof id !== 'number' || id < 0) {
//       return reply.code(400).send({ error: 'Invalid user ID' });
//     }

//     try {
//       const user = await fastify.prisma.user.create({
//         data: { id }
//       });
//       return reply.code(201).send(user);
//     } catch (error) {
//       fastify.log.error(error);
      
//       if (error.code === 'P2002') {
//         return reply.code(409).send({ 
//           error: 'User exists',
//           details: `User with ID ${id} already exists`
//         });
//       }
      
//       return reply.code(500).send({ 
//         error: 'Database error',
//         details: error.message 
//       });
//     }
//   });

//   fastify.get('/', async (request, reply) => {
//     try {
//       const users = await fastify.prisma.user.findMany();
//       return reply.send(users);
//     } catch (error) {
//       fastify.log.error(error);
//       return reply.code(500).send({ 
//         error: 'Database error',
//         details: error.message 
//       });
//     }
//   });
// }

// export default userRoutes;