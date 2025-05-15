// import { getReceiverSocket } from "../socket/socket.js";

// export function SendMessage(fastify) {
//   return async function handler(request, reply) {
//     const prisma = fastify.prisma;
//     try {
//       const { message } = JSON.parse(request.body) || "";
//       const senderId = parseInt(request.user.id); //request.user.id;
//       const receiverId = parseInt(request.params.id, 10);
//       if (!message)
//         return reply.code(400).send({ error: "Message content is required " });
//       /*
//             TODO Verify receiverId , verify sendid by middleware and get it 
//             For testing, get user ID from header or default to 1
//         */

//       // Find or create conversation
//       let conversation = await prisma.conversation.findFirst({
//         where: {
//           AND: [
//             { participants: { some: { userId: senderId } } },
//             { participants: { some: { userId: receiverId } } },
//           ],
//         },
//         include: { participants: true },
//       });

//       if (!conversation) {
//         conversation = await prisma.conversation.create({
//           data: {
//             participants: {
//               create: [{ userId: senderId }, { userId: receiverId }],
//             },
//           },
//         });
//       }

//       // Create message
//       const newMessage = await prisma.message.create({
//         data: {
//           content: message,
//           senderId,
//           receiverId,
//           conversationId: conversation.id,
//         },
//         include: {
//           conversation: {
//             include: { participants: true },
//           },
//         },
//       });

//       // Get receiver socket id if its online
//       const receiverSocket = getReceiverSocket(receiverId);
//       if (receiverSocket) {
//         receiverSocket.send(
//           JSON.stringify({
//             type: "newMessage",
//             message: newMessage,
//           })
//         );

//         fastify.log.info(`Message sent to user ${receiverId} via WebSocket`);
//       } else {
//         fastify.log.info(
//           `User ${receiverId} is not connected, message saved to DB only`
//         );
//       }

//       return reply.code(201).send(newMessage);
//     } catch (error) {
//       console.error(error);
//       reply.code(500).send({ error: "Internal server error" });
//     }
//   };
// }
