# TrackMed WebSocket Server

Central WebSocket server for real-time communication between TrackMed backends (admin-be, user-be) and clients (mobile app, admin dashboard).

## Architecture

```
┌─────────────────┐         ┌──────────────────────┐         ┌─────────────────┐
│                 │         │                      │         │                 │
│    admin-be     │◄───────►│   WebSocket Server   │◄───────►│    user-be      │
│   (port 3000)   │         │     (port 3003)      │         │   (port 3001)   │
│                 │         │                      │         │                 │
└─────────────────┘         └──────────┬───────────┘         └─────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
            ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
            │  Mobile App   │  │ Admin Panel   │  │  Other Clients │
            │  (Consumer)   │  │  (Dashboard)  │  │               │
            └───────────────┘  └───────────────┘  └───────────────┘
```

## Features

- **Multi-client support**: Users, Admins, Backend Services
- **Channel-based messaging**: Subscribe to specific events
- **JWT Authentication**: For users and admins
- **Service Keys**: For backend-to-backend communication
- **Event Types**: Orders, Batches, Fraud Alerts, Notifications

## Quick Start

```bash
cd websocket
npm install
npm run dev
```

## Ports

| Service | Port |
|---------|------|
| WebSocket Server | 3003 |
| HTTP Health Check | 3004 |

## Environment Variables

```env
WS_PORT=3003
HTTP_PORT=3004
NODE_ENV=development

# JWT Secrets (must match backend secrets)
JWT_SECRET_USER=your-user-be-jwt-secret
JWT_SECRET_ADMIN=your-admin-be-jwt-secret

# Service Keys (for backend auth)
ADMIN_BE_SERVICE_KEY=admin-service-key
USER_BE_SERVICE_KEY=user-service-key
```

## Message Types

### Authentication

```json
{
  "type": "AUTH",
  "payload": {
    "token": "jwt-token",          // For users/admins
    "clientType": "user"           // "user", "admin", "service"
  }
}
```

For backends:
```json
{
  "type": "AUTH",
  "payload": {
    "serviceKey": "service-secret-key",
    "clientType": "service",
    "serviceType": "user-be"       // "admin-be" or "user-be"
  }
}
```

### Subscribe to Channels

```json
{
  "type": "SUBSCRIBE",
  "payload": {
    "channels": ["orders:user123", "notifications:user123"]
  }
}
```

### Order Events

```json
{
  "type": "ORDER_STATUS_CHANGED",
  "payload": {
    "orderId": "order-123",
    "orderNumber": "TM26011412AB",
    "userId": "user-123",
    "status": "SHIPPED",
    "previousStatus": "PROCESSING"
  }
}
```

### Batch Events

```json
{
  "type": "BATCH_RECALLED",
  "payload": {
    "batchId": "batch-123",
    "batchNumber": "BN-2026-001",
    "medicineName": "Paracetamol 500mg",
    "status": "RECALLED"
  }
}
```

### Notifications

```json
{
  "type": "NOTIFICATION",
  "payload": {
    "title": "Order Update",
    "body": "Your order has been shipped!",
    "targetUsers": ["user-123"]
  }
}
```

## Channel Naming Convention

| Channel | Description |
|---------|-------------|
| `user:{userId}` | All events for a specific user |
| `orders:{userId}` | Order events for a user |
| `notifications:{userId}` | Notifications for a user |
| `admin:all` | All admin events |
| `alerts:all` | All fraud alerts |
| `service:all` | All service events |
| `service:{serviceType}` | Events for specific service |

## Client Libraries

### JavaScript/TypeScript (for backends)

```typescript
import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3003');

ws.on('open', () => {
  // Authenticate as service
  ws.send(JSON.stringify({
    type: 'AUTH',
    payload: {
      serviceKey: 'your-service-key',
      clientType: 'service',
      serviceType: 'user-be'
    }
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  console.log('Received:', message);
});

// Emit order event
ws.send(JSON.stringify({
  type: 'ORDER_CREATED',
  payload: {
    orderId: 'order-123',
    orderNumber: 'TM26011412AB',
    userId: 'user-123',
    status: 'PENDING'
  }
}));
```

### Kotlin (for mobile app)

```kotlin
// Use OkHttp WebSocket client
val client = OkHttpClient()
val request = Request.Builder()
    .url("ws://your-server:3003")
    .build()

val listener = object : WebSocketListener() {
    override fun onOpen(webSocket: WebSocket, response: Response) {
        // Authenticate
        webSocket.send("""
            {
                "type": "AUTH",
                "payload": {
                    "token": "$jwtToken",
                    "clientType": "user"
                }
            }
        """.trimIndent())
    }
    
    override fun onMessage(webSocket: WebSocket, text: String) {
        val message = JSONObject(text)
        when (message.getString("type")) {
            "ORDER_STATUS_CHANGED" -> handleOrderUpdate(message)
            "NOTIFICATION" -> showNotification(message)
        }
    }
}

client.newWebSocket(request, listener)
```

## Health Check

```bash
curl http://localhost:3004/health
```

Response:
```json
{
  "success": true,
  "status": "healthy",
  "service": "TrackMed WebSocket Server",
  "stats": {
    "totalClients": 5,
    "uniqueUsers": 3,
    "activeChannels": 8,
    "services": ["admin-be", "user-be"]
  }
}
```
