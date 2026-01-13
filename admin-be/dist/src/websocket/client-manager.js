"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientManager = void 0;
const client_1 = require("@prisma/client");
class ClientManager {
    clients = new Map();
    superAdminClients = new Set();
    manufacturerClients = new Set();
    addClient(client) {
        const clientId = this.generateClientId(client.userId, client.socket);
        this.clients.set(clientId, client);
        if (client.role === client_1.UserRole.ADMIN) {
            this.superAdminClients.add(clientId);
        }
        else if (client.role === client_1.UserRole.MANUFACTURER) {
            this.manufacturerClients.add(clientId);
        }
    }
    removeClient(socket) {
        let clientIdToRemove = null;
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
    getSuperAdminClients() {
        return Array.from(this.superAdminClients)
            .map((id) => this.clients.get(id))
            .filter((client) => client !== undefined);
    }
    getManufacturerClients() {
        return Array.from(this.manufacturerClients)
            .map((id) => this.clients.get(id))
            .filter((client) => client !== undefined);
    }
    getClientBySocket(socket) {
        for (const client of this.clients.values()) {
            if (client.socket === socket) {
                return client;
            }
        }
        return undefined;
    }
    getClientCount() {
        return this.clients.size;
    }
    getSuperAdminCount() {
        return this.superAdminClients.size;
    }
    getManufacturerCount() {
        return this.manufacturerClients.size;
    }
    getAllClients() {
        return Array.from(this.clients.values());
    }
    getClientByUserId(userId) {
        for (const client of this.clients.values()) {
            if (client.userId === userId) {
                return client;
            }
        }
        return undefined;
    }
    generateClientId(userId, socket) {
        return `${userId}-${socket.url || 'unknown'}`;
    }
}
exports.clientManager = new ClientManager();
//# sourceMappingURL=client-manager.js.map