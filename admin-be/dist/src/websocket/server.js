"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeWebSocketServer = initializeWebSocketServer;
exports.getWebSocketServer = getWebSocketServer;
exports.closeWebSocketServer = closeWebSocketServer;
const ws_1 = require("ws");
const auth_1 = require("./auth");
const client_manager_1 = require("./client-manager");
const location_handler_1 = require("./location-handler");
const chat_handler_1 = require("./chat-handler");
let wss = null;
function initializeWebSocketServer(httpServer) {
    wss = new ws_1.Server({
        server: httpServer,
        path: '/ws',
    });
    wss.on('connection', (socket) => {
        const authSocket = socket;
        let isAuthenticated = false;
        console.log('New WebSocket connection attempt');
        socket.on('message', async (data) => {
            try {
                const message = JSON.parse(data.toString());
                if (!isAuthenticated) {
                    if (message.type === 'AUTH' && message.payload?.token) {
                        const authResult = await (0, auth_1.authenticateWebSocket)(authSocket, message.payload.token);
                        if (!authResult.success) {
                            (0, auth_1.sendAuthError)(socket, authResult.error || 'Authentication failed');
                            socket.close(1008, 'Authentication failed');
                            return;
                        }
                        isAuthenticated = true;
                        const client = {
                            socket: authSocket,
                            userId: authResult.userId,
                            role: authResult.role,
                            connectedAt: new Date(),
                        };
                        client_manager_1.clientManager.addClient(client);
                        socket.send(JSON.stringify({
                            type: 'AUTH',
                            payload: { success: true, role: authResult.role },
                        }));
                        console.log(`Client authenticated: ${authResult.userId} (${authResult.role})`);
                        if (authResult.role === 'SUPERADMIN') {
                            console.log(`SUPERADMIN client connected. Total SUPERADMIN clients: ${client_manager_1.clientManager.getSuperAdminCount()}`);
                        }
                        else if (authResult.role === 'MANUFACTURER') {
                            console.log(`MANUFACTURER client connected. Total MANUFACTURER clients: ${client_manager_1.clientManager.getManufacturerCount()}`);
                        }
                    }
                    else {
                        (0, auth_1.sendAuthError)(socket, 'Authentication required. Send AUTH message with token first.');
                        socket.close(1008, 'Authentication required');
                        return;
                    }
                }
                else {
                    if (message.type === 'LOCATION') {
                        if (!(0, location_handler_1.validateLocationMessage)(message)) {
                            socket.send(JSON.stringify({
                                type: 'ERROR',
                                error: 'Invalid location message format',
                            }));
                            return;
                        }
                        // Find the client by matching socket property
                        const client = client_manager_1.clientManager.getClientBySocket(socket);
                        if (!client) {
                            socket.send(JSON.stringify({
                                type: 'ERROR',
                                error: 'Client not found',
                            }));
                            return;
                        }
                        if (client.role !== 'MANUFACTURER') {
                            socket.send(JSON.stringify({
                                type: 'ERROR',
                                error: 'Only MANUFACTURER users can send location updates',
                            }));
                            return;
                        }
                        const result = await (0, location_handler_1.handleLocationMessage)(message, client.userId);
                        if (!result.success) {
                            socket.send(JSON.stringify({
                                type: 'ERROR',
                                error: result.error || 'Failed to process location update',
                            }));
                        }
                    }
                    else if (message.type === 'CHAT') {
                        if (!(0, chat_handler_1.validateChatMessage)(message)) {
                            socket.send(JSON.stringify({
                                type: 'ERROR',
                                error: 'Invalid chat message format',
                            }));
                            return;
                        }
                        const client = client_manager_1.clientManager.getClientBySocket(socket);
                        if (!client) {
                            socket.send(JSON.stringify({
                                type: 'ERROR',
                                error: 'Client not found',
                            }));
                            return;
                        }
                        if (client.role !== 'ADMIN' && client.role !== 'MANUFACTURER') {
                            socket.send(JSON.stringify({
                                type: 'ERROR',
                                error: 'Only ADMIN and MANUFACTURER users can chat',
                            }));
                            return;
                        }
                        const result = await (0, chat_handler_1.handleChatMessage)(message, client.userId, client.role);
                        if (!result.success) {
                            socket.send(JSON.stringify({
                                type: 'ERROR',
                                error: result.error || 'Failed to process chat message',
                            }));
                        }
                    }
                    else if (message.type === 'PING') {
                        socket.send(JSON.stringify({ type: 'PONG' }));
                    }
                    else {
                        socket.send(JSON.stringify({
                            type: 'ERROR',
                            error: 'Unknown message type',
                        }));
                    }
                }
            }
            catch (error) {
                console.error('WebSocket message error:', error);
                socket.send(JSON.stringify({
                    type: 'ERROR',
                    error: error.message || 'Invalid message format',
                }));
            }
        });
        socket.on('close', () => {
            if (isAuthenticated) {
                client_manager_1.clientManager.removeClient(socket);
                console.log('Client disconnected');
            }
        });
        socket.on('error', (error) => {
            console.error('WebSocket error:', error);
            if (isAuthenticated) {
                client_manager_1.clientManager.removeClient(socket);
            }
        });
        const authTimeout = setTimeout(() => {
            if (!isAuthenticated) {
                (0, auth_1.sendAuthError)(socket, 'Authentication timeout');
                socket.close(1008, 'Authentication timeout');
            }
        }, 10000);
        socket.once('message', () => {
            clearTimeout(authTimeout);
        });
    });
    console.log('WebSocket server initialized on path /ws');
}
function getWebSocketServer() {
    return wss;
}
function closeWebSocketServer() {
    if (wss) {
        wss.close();
        wss = null;
    }
}
//# sourceMappingURL=server.js.map