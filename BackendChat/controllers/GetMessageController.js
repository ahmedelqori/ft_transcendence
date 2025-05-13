export function GetMessage(fastify) {
    return async function handler(request, reply) {
        const prisma = fastify.prisma;
    
    try{
        const userToChatId = parseInt(request.params.id, 10);
        const senderId =  parseInt(request.user.id); // fake testing
        console.log("testiung -=>  ",senderId);
        //const senderId = request.user.id || -1;

        if (isNaN(userToChatId) || senderId == -1) {
            return reply.code(400).send({ error: 'Invalid user ID parameter' });
        }
        const conversation = await prisma.conversation.findFirst({
            where: {
            AND: [
                { participants: { some: { userId: senderId } } },
                { participants: { some: { userId: userToChatId } } }
            ]
            },
            include: {
            messages: {
                select: {
                id: true,
                content: true,
                senderId: true,
                receiverId: true,
                createdAt: true,
                updatedAt: true
                },
                orderBy: {
                createdAt: 'asc' // Oldest first, use 'desc' for newest first
                }
            }
            }
        });

        if (!conversation) {
            return reply.code(200).send([]); // Return empty array if no conversation exists
        }

        const messages = conversation.messages.map(msg => ({
        id: msg.id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        content: msg.content,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt
        }));

        return reply.code(200).send(messages);

    }catch(error)
    {
        console.error(error);
        reply.code(500).send({ error: 'Internal server error' }); 
    }
};
}