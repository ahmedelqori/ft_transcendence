
export function socketDocsPlugin(fastify, options, done) {
  fastify.get('/socket-docs', {
    schema: {
      hide: true 
    },
    handler: (request, reply) => {
      const socketDocs = {
        info: {
          title: "Socket.IO API Documentation",
          description: "WebSocket events for real-time game communication",
          version: "1.0.0"
        },
        events: {
          client: [
            {
              name: "joinGame",
              description: "Join a game session",
              parameters: {},
              example: "socket.emit('joinGame', {})"
            },
            {
              name: "startGame",
              description: "Start the game when both players are ready",
              parameters: {},
              example: "socket.emit('startGame')"
            },
            {
              name: "paddleMove",
              description: "Update paddle position",
              parameters: {
                position: "number - the horizontal position of the paddle"
              },
              example: "socket.emit('paddleMove', 250)"
            },
            {
              name: "pauseGame",
              description: "Pause the current game",
              parameters: {},
              example: "socket.emit('pauseGame')"
            }
          ],
          server: [
            {
              name: "joinedGame",
              description: "Emitted after successfully joining a game",
              data: {
                playerType: "'mainPlayer' | 'secondPlayer'",
                gameId: "number - the game identifier"
              }
            },
            {
              name: "playerJoined",
              description: "Notifies when the other player joins the game",
              data: {
                playerType: "'mainPlayer' | 'secondPlayer'"
              }
            },
            {
              name: "readyToStart",
              description: "Emitted when both players are connected",
              data: {}
            },
            {
              name: "gameStarted",
              description: "Emitted when the game has started",
              data: {}
            },
            {
              name: "gameStateUpdate",
              description: "Real-time game state updates",
              data: {
                ball: { x: "number", y: "number" },
                paddles: { up: "number", down: "number" },
                score: { 
                  mainPlayer: "number", 
                  secondPlayer: "number" 
                },
                ended: "boolean"
              }
            },
            {
              name: "playerDisconnected",
              description: "Emitted when a player disconnects",
              data: {
                playerType: "'mainPlayer' | 'secondPlayer'"
              }
            },
            {
              name: "gameOver",
              description: "Emitted when the game has ended",
              data: {
                winner: "'mainPlayer' | 'secondPlayer'",
                score: {
                  mainPlayer: "number",
                  secondPlayer: "number"
                }
              }
            },
            {
              name: "error",
              description: "Emitted when an error occurs",
              data: {
                message: "string - error message"
              }
            }
          ]
        },
        connectionGuide: {
          url: "http://localhost:3000/socket/game",
          options: {
            transports: ["websocket"],
            auth: {
              gameId: "number - the game ID",
              token: "string - authentication token"
            }
          },
          example: `
const socket = io("http://localhost:3000/socket/game", {
transports: ["websocket"],
auth: {
  gameId: 123,
  token: "user-authentication-token"
}
});`
        }
      };
      
      const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Socket.IO API Documentation</title>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            body { 
              padding: 20px; 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            .event-card {
              margin-bottom: 15px;
              border-radius: 4px;
              border: 1px solid #ddd;
            }
            .event-card .card-header {
              font-weight: 600;
              background-color: #f8f9fa;
            }
            pre {
              background-color: #f8f9fa;
              padding: 10px;
              border-radius: 4px;
            }
            .nav-tabs {
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="row mt-4 mb-4">
              <div class="col-12">
                <h1>${socketDocs.info.title}</h1>
                <p class="lead">${socketDocs.info.description}</p>
                <p>Version: ${socketDocs.info.version}</p>
                <hr>
              </div>
            </div>
            
            <div class="row mb-4">
              <div class="col-12">
                <h2>Connection</h2>
                <p>Connect to the WebSocket server with:</p>
                <pre>${socketDocs.connectionGuide.example}</pre>
              </div>
            </div>
            
            <div class="row">
              <div class="col-12">
                <ul class="nav nav-tabs" id="myTab" role="tablist">
                  <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="client-tab" data-bs-toggle="tab" data-bs-target="#client" type="button" role="tab" aria-controls="client" aria-selected="true">Client Events</button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link" id="server-tab" data-bs-toggle="tab" data-bs-target="#server" type="button" role="tab" aria-controls="server" aria-selected="false">Server Events</button>
                  </li>
                </ul>
                
                <div class="tab-content" id="myTabContent">
                  <div class="tab-pane fade show active" id="client" role="tabpanel" aria-labelledby="client-tab">
                    <h3 class="mt-4">Client to Server Events</h3>
                    <p>Events that your client code emits to the server:</p>
                    
                    ${socketDocs.events.client.map(event => `
                      <div class="card event-card">
                        <div class="card-header">
                          ${event.name}
                        </div>
                        <div class="card-body">
                          <p>${event.description}</p>
                          ${Object.keys(event.parameters).length > 0 ? 
                            `<h5>Parameters:</h5>
                            <ul>
                              ${Object.entries(event.parameters).map(([key, value]) => 
                                `<li><strong>${key}</strong>: ${value}</li>`
                              ).join('')}
                            </ul>` : 
                            '<p>No parameters</p>'
                          }
                          <h5>Example:</h5>
                          <pre>${event.example}</pre>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                  
                  <div class="tab-pane fade" id="server" role="tabpanel" aria-labelledby="server-tab">
                    <h3 class="mt-4">Server to Client Events</h3>
                    <p>Events that your client code should listen for:</p>
                    
                    ${socketDocs.events.server.map(event => `
                      <div class="card event-card">
                        <div class="card-header">
                          ${event.name}
                        </div>
                        <div class="card-body">
                          <p>${event.description}</p>
                          <h5>Response Data:</h5>
                          <pre>${JSON.stringify(event.data, null, 2)}</pre>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
        </body>
      </html>
      `;
      
      reply.type('text/html').send(html);
    }
  });

  done();
}

export function docsPortalPlugin(fastify, options, done) {
  fastify.get('/swagger', (request, reply) => {
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>API Documentation Portal</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body>
        <div class="container mt-5">
          <p class="lead">Choose the documentation you want to view:</p>
          <div class="row mt-4">
            <div class="col-md-6">
              <div class="card mb-4">
                <div class="card-header">
                  <h3>REST API Documentation</h3>
                </div>
                <div class="card-body">
                  <p>View the REST API endpoints documentation with Swagger UI.</p>
                  <a href="/api-docs" class="btn btn-primary">REST API Documentation</a>
                </div>
              </div>
            </div>
            
            <div class="col-md-6">
              <div class="card mb-4">
                <div class="card-header">
                  <h3>Socket.IO Documentation</h3>
                </div>
                <div class="card-body">
                  <p>View the WebSocket events documentation for real-time features.</p>
                  <a href="/socket-docs" class="btn btn-success">Socket.IO Documentation</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
    `;
    
    reply.type('text/html').send(html);
  });
  
  done();
}