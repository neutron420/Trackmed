"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateWebSocket = authenticateWebSocket;
exports.sendAuthError = sendAuthError;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
async function authenticateWebSocket(socket, token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await database_1.default.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                role: true,
                isActive: true,
            },
        });
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        if (!user.isActive) {
            return { success: false, error: 'User account is inactive' };
        }
        socket.userId = user.id;
        socket.role = user.role;
        return {
            success: true,
            userId: user.id,
            role: user.role,
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.message || 'Authentication failed',
        };
    }
}
function sendAuthError(socket, message) {
    socket.send(JSON.stringify({
        type: 'ERROR',
        error: message,
    }));
}
//# sourceMappingURL=auth.js.map