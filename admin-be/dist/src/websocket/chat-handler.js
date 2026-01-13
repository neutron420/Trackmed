"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChatMessage = handleChatMessage;
exports.validateChatMessage = validateChatMessage;
const client_manager_1 = require("./client-manager");
const database_1 = __importDefault(require("../config/database"));
async function handleChatMessage(message, senderUserId, senderRole) {
    try {
        const { payload } = message;
        if (!payload.message || typeof payload.message !== 'string') {
            return {
                success: false,
                error: 'Message is required and must be a string',
            };
        }
        if (payload.message.trim().length === 0) {
            return {
                success: false,
                error: 'Message cannot be empty',
            };
        }
        if (payload.message.length > 1000) {
            return {
                success: false,
                error: 'Message too long (max 1000 characters)',
            };
        }
        if (senderRole !== 'ADMIN' && senderRole !== 'MANUFACTURER') {
            return {
                success: false,
                error: 'Only ADMIN and MANUFACTURER users can chat',
            };
        }
        const sender = await database_1.default.user.findUnique({
            where: { id: senderUserId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });
        if (!sender) {
            return {
                success: false,
                error: 'Sender not found',
            };
        }
        const chatData = {
            type: 'CHAT_RECEIVED',
            payload: {
                message: payload.message,
                senderId: senderUserId,
                senderName: sender.name || sender.email,
                senderRole: sender.role,
                recipientId: payload.recipientId,
                timestamp: payload.timestamp || new Date().toISOString(),
            },
        };
        const allClients = client_manager_1.clientManager.getAllClients();
        const messageStr = JSON.stringify(chatData);
        if (payload.recipientId) {
            const recipientClients = allClients.filter((client) => client.userId === payload.recipientId &&
                (client.role === 'ADMIN' || client.role === 'MANUFACTURER'));
            if (recipientClients.length === 0) {
                return {
                    success: false,
                    error: 'Recipient not connected or not authorized',
                };
            }
            recipientClients.forEach((client) => {
                if (client.socket.readyState === 1) {
                    client.socket.send(messageStr);
                }
            });
            if (senderUserId !== payload.recipientId) {
                const senderClients = allClients.filter((client) => client.userId === senderUserId);
                senderClients.forEach((client) => {
                    if (client.socket.readyState === 1) {
                        client.socket.send(messageStr);
                    }
                });
            }
            console.log(`Chat message sent from ${senderUserId} (${senderRole}) to ${payload.recipientId}`);
        }
        else {
            const adminAndManufacturerClients = allClients.filter((client) => client.role === 'ADMIN' || client.role === 'MANUFACTURER');
            adminAndManufacturerClients.forEach((client) => {
                if (client.socket.readyState === 1) {
                    client.socket.send(messageStr);
                }
            });
            console.log(`Broadcast chat message from ${senderUserId} (${senderRole}) to all ADMIN/MANUFACTURER clients`);
        }
        return { success: true };
    }
    catch (error) {
        console.error('Error handling chat message:', error);
        return {
            success: false,
            error: error.message || 'Failed to process chat message',
        };
    }
}
function validateChatMessage(message) {
    if (!message || typeof message !== 'object') {
        return false;
    }
    if (message.type !== 'CHAT') {
        return false;
    }
    if (!message.payload || typeof message.payload !== 'object') {
        return false;
    }
    const { payload } = message;
    return (typeof payload.message === 'string' &&
        payload.message.trim().length > 0 &&
        payload.message.length <= 1000 &&
        (payload.recipientId === undefined || typeof payload.recipientId === 'string'));
}
//# sourceMappingURL=chat-handler.js.map