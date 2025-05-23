import { v4 as uuidv4 } from "uuid";
import { getReceiverSocket } from "../socket/socket.js";
const MAX_MESSAGE_BATCH_SIZE = 5;
export async function handleSendMessage(
  data,
  userId,
  connection,
  app,
  messageBatches
) {
  const prisma = app.prisma;
  const { content, receiverId } = data;

  // 1) Récupération de la conversation (id)
  let conversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: userId } } },
        { participants: { some: { userId: receiverId } } },
      ],
    },
    select: { id: true },
  });

  if (!conversation && receiverId && userId) {
    conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: userId }, { userId: receiverId }],
        },
      },
    });
  }

  if (!messageBatches.has(conversation.id))
    messageBatches.set(conversation.id, []);
  const batch = messageBatches.get(conversation.id);
  batch.push({
    id: uuidv4(),
    content,
    senderId: userId,
    receiverId,
    conversationId: conversation.id,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // 3) check length of messageBatches[conversation.id] if its greater than 10 than store in db
  if (batch.length >= MAX_MESSAGE_BATCH_SIZE) {
    const messagesToStore = batch.slice(0, MAX_MESSAGE_BATCH_SIZE);
    try {
      await prisma.message.createMany({
        data: messagesToStore,
      });
      // Remove processed messages
      messageBatches.set(conversation.id, batch.slice(MAX_MESSAGE_BATCH_SIZE));
    } catch (error) {
      console.error("Error storing messages:", error);
    }
  }

  // 4) Envoi du message au destinataire
  // need to broadcast msg also foer sendID
  const receiverSocket = getReceiverSocket(receiverId);
  const uid = uuidv4();
  if (receiverSocket) {
    receiverSocket.send(
      JSON.stringify({
        type: "newMessage",
        message: {
          id: uid,
          content,
          senderId: userId,
          receiverId,
          conversationId: conversation.id,
        },
      })
    );

  }
}
