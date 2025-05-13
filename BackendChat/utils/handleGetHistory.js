export async function handleGetHistory(data, userId, connection, app) {
  const prisma = app.prisma;
  const { receiverId, page = 1 } = data;
  const limit = 20;
  const skip = (page - 1) * limit;

  // 1) Récupération de la conversation (id)
  const conversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: userId } } },
        { participants: { some: { userId: receiverId } } },
      ],
    },
    select: { id: true },
  });

  console.log("handleGetHistory :", receiverId, page, conversation);

  if (!conversation) {
    if (connection.readyState === connection.OPEN) {
      connection.send(
        JSON.stringify({
          type: "messageHistory",
          messages: [],
        })
      );
    }
    return;
  }

  const rawMessages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" }, // on prend d’abord les plus récents
    skip,
    take: limit,
    select: {
      id: true,
      content: true,
      senderId: true,
      receiverId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (connection.readyState === connection.OPEN) {
    connection.send(
      JSON.stringify({
        type: "messageHistory",
        messages: rawMessages,
      })
    );
  }
}

export async function handleSendMessage(data, userId, connection, app) {
  console.log("handleSendMessage");
}
