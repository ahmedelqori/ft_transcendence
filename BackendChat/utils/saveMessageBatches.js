
export async function saveMessageBatches(messageBatches,prisma)
{
    try {
        await prisma.$transaction(async (tx) => {
            for (const [conversationId, messages] of messageBatches.entries())
            {
                if (messages.length === 0) continue;
                 console.log(`Saving ${messages.length} messages for conversation ${conversationId}`);
                await tx.message.createMany({
                data: messages.map(msg => ({
                    id: msg.id,
                    content: msg.content,
                    senderId: msg.senderId,
                    receiverId: msg.receiverId,
                    conversationId: msg.conversationId,
                    createdAt: msg.createdAt || new Date(),
                    updatedAt: msg.updatedAt || new Date()
                }))
                });
                await tx.conversation.update({
                where: { id: conversationId },
                data: { updatedAt: new Date() }
                });
                console.log(`Successfully saved ${messageBatches.size} conversation batches`);
            }
        });

        
    } catch (error) {
        console.error('Error saving message batches:', error);
    }finally {
        messageBatches.clear();
        await prisma.$disconnect();
    }
}