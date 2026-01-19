import WebSocket, { Server as WebSocketServer } from 'ws';
import { Server } from 'http';
import { AuthenticatedSocket, WebSocketMessage, LocationMessage, ChatMessage, UserRole } from '../types/websocket';
import { authenticateWebSocket, sendAuthError } from './auth';
import { clientManager } from './client-manager';
import { handleLocationMessage, validateLocationMessage } from './location-handler';
import { handleChatMessage, validateChatMessage } from './chat-handler';

let wss: WebSocketServer | null = null;

export function initializeWebSocketServer(httpServer: Server): void {
  wss = new WebSocketServer({
    server: httpServer,
    path: '/ws',
  });

  wss.on('connection', (socket: WebSocket) => {
    const authSocket = socket as AuthenticatedSocket;
    let isAuthenticated = false;

    console.log('New WebSocket connection attempt');

    socket.on('message', async (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());

        if (!isAuthenticated) {
          if (message.type === 'AUTH' && message.payload?.token) {
            const authResult = await authenticateWebSocket(authSocket, message.payload.token);

            if (!authResult.success) {
              sendAuthError(socket, authResult.error || 'Authentication failed');
              socket.close(1008, 'Authentication failed');
              return;
            }

            isAuthenticated = true;

            const role = (authResult.role || 'SCANNER') as UserRole;

            const client = {
              socket: authSocket,
              userId: authResult.userId!,
              role,
              connectedAt: new Date(),
            };

            clientManager.addClient(client);

            socket.send(
              JSON.stringify({
                type: 'AUTH',
                payload: { success: true, role: authResult.role },
              })
            );

            console.log(
              `Client authenticated: ${authResult.userId} (${authResult.role})`
            );

            if (authResult.role === 'SUPERADMIN') {
              console.log(`SUPERADMIN client connected. Total SUPERADMIN clients: ${clientManager.getSuperAdminCount()}`);
            } else if (authResult.role === 'MANUFACTURER') {
              console.log(`MANUFACTURER client connected. Total MANUFACTURER clients: ${clientManager.getManufacturerCount()}`);
            }
          } else {
            sendAuthError(socket, 'Authentication required. Send AUTH message with token first.');
            socket.close(1008, 'Authentication required');
            return;
          }
        } else {
          if (message.type === 'LOCATION') {
            if (!validateLocationMessage(message)) {
              socket.send(
                JSON.stringify({
                  type: 'ERROR',
                  error: 'Invalid location message format',
                })
              );
              return;
            }

            // Find the client by matching socket property
            const client = clientManager.getClientBySocket(socket);
            if (!client) {
              socket.send(
                JSON.stringify({
                  type: 'ERROR',
                  error: 'Client not found',
                })
              );
              return;
            }

            if (client.role !== 'MANUFACTURER') {
              socket.send(
                JSON.stringify({
                  type: 'ERROR',
                  error: 'Only MANUFACTURER users can send location updates',
                })
              );
              return;
            }

            const result = await handleLocationMessage(message as LocationMessage, client.userId);

            if (!result.success) {
              socket.send(
                JSON.stringify({
                  type: 'ERROR',
                  error: result.error || 'Failed to process location update',
                })
              );
            }
          } else if (message.type === 'CHAT') {
            if (!validateChatMessage(message)) {
              socket.send(
                JSON.stringify({
                  type: 'ERROR',
                  error: 'Invalid chat message format',
                })
              );
              return;
            }

            const client = clientManager.getClientBySocket(socket);
            if (!client) {
              socket.send(
                JSON.stringify({
                  type: 'ERROR',
                  error: 'Client not found',
                })
              );
              return;
            }

            if (client.role !== 'ADMIN' && client.role !== 'MANUFACTURER') {
              socket.send(
                JSON.stringify({
                  type: 'ERROR',
                  error: 'Only ADMIN and MANUFACTURER users can chat',
                })
              );
              return;
            }

            const result = await handleChatMessage(
              message as ChatMessage,
              client.userId,
              client.role
            );

            if (!result.success) {
              socket.send(
                JSON.stringify({
                  type: 'ERROR',
                  error: result.error || 'Failed to process chat message',
                })
              );
            }
          } else if (message.type === 'PING') {
            socket.send(JSON.stringify({ type: 'PONG' }));
          } else {
            socket.send(
              JSON.stringify({
                type: 'ERROR',
                error: 'Unknown message type',
              })
            );
          }
        }
      } catch (error: any) {
        console.error('WebSocket message error:', error);
        socket.send(
          JSON.stringify({
            type: 'ERROR',
            error: error.message || 'Invalid message format',
          })
        );
      }
    });

    socket.on('close', () => {
      if (isAuthenticated) {
        clientManager.removeClient(socket);
        console.log('Client disconnected');
      }
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      if (isAuthenticated) {
        clientManager.removeClient(socket);
      }
    });

    const authTimeout = setTimeout(() => {
      if (!isAuthenticated) {
        sendAuthError(socket, 'Authentication timeout');
        socket.close(1008, 'Authentication timeout');
      }
    }, 10000);

    socket.once('message', () => {
      clearTimeout(authTimeout);
    });
  });

  console.log('WebSocket server initialized on path /ws');
}

export function getWebSocketServer(): WebSocketServer | null {
  return wss;
}

export function closeWebSocketServer(): void {
  if (wss) {
    wss.close();
    wss = null;
  }
}
