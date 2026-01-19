import WebSocket from 'ws';

// Local UserRole type mirroring Prisma enum `UserRole`
export type UserRole =
  | 'ADMIN'
  | 'SUPERADMIN'
  | 'MANUFACTURER'
  | 'DISTRIBUTOR'
  | 'PHARMACY'
  | 'SCANNER'
  | 'CONSUMER';

export interface WebSocketClient {
  socket: WebSocket;
  userId: string;
  role: UserRole;
  connectedAt: Date;
}

export interface LocationMessage {
  type: 'LOCATION';
  payload: {
    batchId: string;
    warehouseId?: string;
    lat: number;
    lng: number;
    timestamp: string;
  };
}

export interface ChatMessage {
  type: 'CHAT';
  payload: {
    message: string;
    recipientId?: string;
    timestamp?: string;
  };
}

export interface WebSocketMessage {
  type: 'LOCATION' | 'CHAT' | 'AUTH' | 'ERROR' | 'PONG' | 'PING' | 'CHAT_RECEIVED';
  payload?: any;
  error?: string;
}

export interface AuthenticatedSocket extends WebSocket {
  userId?: string;
  role?: UserRole;
}
