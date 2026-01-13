import { WebSocketClient } from '../types/websocket';
import WebSocket from 'ws';
declare class ClientManager {
    private clients;
    private superAdminClients;
    private manufacturerClients;
    addClient(client: WebSocketClient): void;
    removeClient(socket: WebSocket): void;
    getSuperAdminClients(): WebSocketClient[];
    getManufacturerClients(): WebSocketClient[];
    getClientBySocket(socket: WebSocket): WebSocketClient | undefined;
    getClientCount(): number;
    getSuperAdminCount(): number;
    getManufacturerCount(): number;
    getAllClients(): WebSocketClient[];
    getClientByUserId(userId: string): WebSocketClient | undefined;
    private generateClientId;
}
export declare const clientManager: ClientManager;
export {};
//# sourceMappingURL=client-manager.d.ts.map