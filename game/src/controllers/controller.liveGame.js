

export const validateGameId = async function(req, reply) {
    const gameId = parseInt(req.params.gameId);
    if (isNaN(gameId)) {
      reply.code(400).send({ error: "Invalid game ID" });
      return;
    }
  
    const game = await req.server.prisma.game.findUnique({ where: { id: gameId } });
  
    if (!game) {
      reply.code(404).send({ error: "Game not found" });
      return;
    }
    req.game = game;
    // we should add the check of the user 
  }


export const liveGame = function(socket, req){
    try {
        console.log(`New WebSocket socket for game ${req.game.id}`)
        socket.on('message', (message) => {
            console.log('Received:', message.toString());
            
            // Send a response back to the client
            socket.send(`Hello from the game ${req.game.id}`);
        });
    
        // Handle client disconnection
        // connection.socket.on('close', () => {
        //     console.log('Client disconnected');
        // });
    } catch (error) {
        console.error("Error:", error);
    }

}