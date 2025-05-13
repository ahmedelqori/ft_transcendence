import { v4 as uuidv4 } from "uuid";
import { getReceiverSocket } from "../socket/socket.js";
const MAX_MESSAGE_BATCH_SIZE = 1;
export async function handleSendMessage(
  data,
  userId,
  connection,
  app,
  messageBatches
) {
  const prisma = app.prisma;
  const { content, receiverId } = data;
  console.log("handleSendMessage:", receiverId, content);

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
  // 2)  messageBatches its map key is conversationid with value is an array of messages
  // need to set conversationId as key and message as value
  if (!messageBatches[conversation.id]) messageBatches[conversation.id] = [];
    messageBatches[conversation.id].push({
      id: uuidv4(),
      content,
      senderId: userId,
      receiverId,
      conversationId: conversation.id,
    });

  // 3) check length of messageBatches[conversation.id] if its greater than 10 than store in db
  if (messageBatches[conversation.id].length >= MAX_MESSAGE_BATCH_SIZE) {
    // need to get messages from 0 to MAX_MESSAGE_BATCH_SIZE from messageBatches[conversation.id]
    const messagesToStore = messageBatches[conversation.id].slice(
      0,
      MAX_MESSAGE_BATCH_SIZE
    );
    console.log(
      "____________________________Storing messages:",
      messagesToStore
    );
    try {
      await prisma.message.createMany({
        data: messagesToStore,
      });
      // remove the first MAX_MESSAGE_BATCH_SIZE messages from the array
      messageBatches[conversation.id] = messageBatches[conversation.id].slice(
        MAX_MESSAGE_BATCH_SIZE
      );
    } catch (error) {
      console.error("Error storing messages:", error);
      // handle error
    }
  }

  // 4) Envoi du message au destinataire
  // need to broadcast msg also foer sendID
  const receiverSocket = getReceiverSocket(receiverId);
  const sendSocket = getReceiverSocket(userId);
  console.log("--------> Receiver socket state:", receiverId);
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

  } else {
    console.log("Receiver is not online");
  }
}
