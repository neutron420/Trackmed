import WebSocket from 'ws';
import { AuthenticatedSocket } from '../types/websocket';
export interface AuthPayload {
    userId: string;
    role: string;
}
export declare function authenticateWebSocket(socket: AuthenticatedSocket, token: string): Promise<{
    success: boolean;
    userId?: string;
    role?: string;
    error?: string;
}>;
export declare function sendAuthError(socket: WebSocket, message: string): void;
//# sourceMappingURL=auth.d.ts.map