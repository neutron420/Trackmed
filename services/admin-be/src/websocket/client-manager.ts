import { WebSocketClient } from '../types/websocket';
import WebSocket from 'ws';

// Local UserRole type mirroring Prisma enum `UserRole`
type UserRoleType =
  | 'ADMIN'
  | 'SUPERADMIN'
  | 'MANUFACTURER'
  | 'DISTRIBUTOR'
  | 'PHARMACY'
  | 'SCANNER'
  | 'CONSUMER';
class ClientManager {
  private clients: Map<string, WebSocketClient> = new Map();
  private superAdminClients: Set<string> = new Set();
  private manufacturerClients: Set<string> = new Set();

  addClient(client: WebSocketClient): void {
    const clientId = this.generateClientId(client.userId, client.socket);
    this.clients.set(clientId, client);

    if (client.role === 'ADMIN' || client.role === 'SUPERADMIN') {
      this.superAdminClients.add(clientId);
    } else if (client.role === 'MANUFACTURER') {
      this.manufacturerClients.add(clientId);
    }
  }

  removeClient(socket: WebSocket): void {
    let clientIdToRemove: string | null = null;

    for (const [id, client] of this.clients.entries()) {
      if (client.socket === socket) {
        clientIdToRemove = id;
        break;
      }
    }

    if (clientIdToRemove) {
      this.clients.delete(clientIdToRemove);
      this.superAdminClients.delete(clientIdToRemove);
      this.manufacturerClients.delete(clientIdToRemove);
    }
  }

  getSuperAdminClients(): WebSocketClient[] {
    return Array.from(this.superAdminClients)
      .map((id) => this.clients.get(id))
      .filter((client): client is WebSocketClient => client !== undefined);
  }

  getManufacturerClients(): WebSocketClient[] {
    return Array.from(this.manufacturerClients)
      .map((id) => this.clients.get(id))
      .filter((client): client is WebSocketClient => client !== undefined);
  }

  getClientBySocket(socket: WebSocket): WebSocketClient | undefined {
    for (const client of this.clients.values()) {
      if (client.socket === socket) {
        return client;
      }
    }
    return undefined;
  }

  getClientCount(): number {
    return this.clients.size;
  }

  getSuperAdminCount(): number {
    return this.superAdminClients.size;
  }

  getManufacturerCount(): number {
    return this.manufacturerClients.size;
  }

  getAllClients(): WebSocketClient[] {
    return Array.from(this.clients.values());
  }

  getClientByUserId(userId: string): WebSocketClient | undefined {
    for (const client of this.clients.values()) {
      if (client.userId === userId) {
        return client;
      }
    }
    return undefined;
  }

  private generateClientId(userId: string, socket: WebSocket): string {
    return `${userId}-${socket.url || 'unknown'}`;
  }
}

export const clientManager = new ClientManager();
