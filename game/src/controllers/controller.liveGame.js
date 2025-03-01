

export const validateGameId = async function(req, reply) {
    const gameId = parseInt(req.params.gameId);
  
    if (isNaN(gameId)) {
      reply.code(400).send({ error: "Invalid game ID" });
      return;
    }
  
    const game = await prisma.game.findUnique({ where: { id: gameId } });
  
    if (!game) {
      reply.code(404).send({ error: "Game not found" });
      return;
    }
    req.game = game;
    // we should add the check of the user 
  }


export const liveGame = async function(connection, req){
    const { gameId } = req.params;
    try {
        const game = await req.server.prisma.game.findUnique({
            where: { id: parseInt(id) },
          });    
        console.log(`New WebSocket connection for game ${gameId}`);
        
    } catch (error) {
        
    }

}