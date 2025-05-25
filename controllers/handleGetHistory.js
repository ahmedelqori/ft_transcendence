export async function handleGetHistory(data, userId, connection, app) {
  const prisma = app.prisma;
  const { receiverId, page = 1 } = data;
  const limit = 100;
  const skip = (page - 1) * limit;

  // 1) Récupération de la conversation (id)
  // that have error i get msg from database , but you forget about msg memory map
  const conversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: userId } } },
        { participants: { some: { userId: receiverId } } },
      ],
    },
    select: { id: true },
  });
  
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
    orderBy: { createdAt: "desc" },
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
        messages: rawMessages.reverse(),
      })
    );
  }
}
