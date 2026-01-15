import { v4 as uuidv4 } from 'uuid';
import { ExtendedWebSocket, WSMessage, AuthMessage, SubscribeMessage } from './types';
import { clientManager } from './client-manager';
import { authenticateClient } from './auth';
import { rateLimiter } from './rate-limiter';

/**
 * Handle incoming messages
 */
export const handleMessage = (ws: ExtendedWebSocket, data: string): void => {
  try {
    // Check rate limit (skip for AUTH messages to allow initial auth)
    const message: WSMessage = JSON.parse(data);
    
    if (message.type !== 'AUTH' && message.type !== 'PING') {
      if (!rateLimiter.isAllowed(ws.id)) {
        sendRateLimitError(ws);
        return;
      }
    }
    
    switch (message.type) {
      case 'AUTH':
        handleAuth(ws, message as AuthMessage);
        break;
        
      case 'SUBSCRIBE':
        handleSubscribe(ws, message as SubscribeMessage);
        break;
        
      case 'UNSUBSCRIBE':
        handleUnsubscribe(ws, message as SubscribeMessage);
        break;
        
      case 'PING':
        handlePing(ws);
        break;
        
      // Events from backends - relay to appropriate clients
      case 'ORDER_CREATED':
      case 'ORDER_STATUS_CHANGED':
      case 'ORDER_PAYMENT_UPDATE':
        handleOrderEvent(ws, message);
        break;
        
      case 'BATCH_CREATED':
      case 'BATCH_STATUS_CHANGED':
      case 'BATCH_RECALLED':
        handleBatchEvent(ws, message);
        break;
        
      case 'FRAUD_ALERT':
        handleFraudAlert(ws, message);
        break;
        
      case 'NOTIFICATION':
        handleNotification(ws, message);
        break;
        
      case 'BROADCAST':
        handleBroadcast(ws, message);
        break;
        
      default:
        console.log(`[Handlers] Unknown message type: ${message.type}`);
    }
  } catch (error) {
    console.error('[Handlers] Error parsing message:', error);
    sendError(ws, 'Invalid message format');
  }
};

/**
 * Handle authentication
 */
const handleAuth = (ws: ExtendedWebSocket, message: AuthMessage): void => {
  const { token, serviceKey, clientType, serviceType } = message.payload;
  
  const result = authenticateClient(token, serviceKey, clientType, serviceType);
  
  if (result.success) {
    ws.clientType = result.clientType!;
    ws.userId = result.userId;
    ws.userRole = result.userRole;
    ws.serviceType = result.serviceType;
    
    // Add to client manager (checks connection limits)
    const added = clientManager.addClient(ws);
    
    if (!added) {
      sendMessage(ws, {
        type: 'AUTH_ERROR',
        payload: { error: 'Connection limit reached. Please try again later.' },
      });
      ws.close(1008, 'Connection limit reached');
      return;
    }
    
    // Auto-subscribe to user's channels
    if (ws.userId) {
      clientManager.subscribeToChannel(ws.id, `user:${ws.userId}`);
      clientManager.subscribeToChannel(ws.id, `orders:${ws.userId}`);
      clientManager.subscribeToChannel(ws.id, `notifications:${ws.userId}`);
    }
    
    // Auto-subscribe services to their channels
    if (ws.clientType === 'service') {
      clientManager.subscribeToChannel(ws.id, 'service:all');
      clientManager.subscribeToChannel(ws.id, `service:${ws.serviceType}`);
    }
    
    // Auto-subscribe admins to admin channels
    if (ws.userRole === 'ADMIN' || ws.userRole === 'SUPERADMIN') {
      clientManager.subscribeToChannel(ws.id, 'admin:all');
      clientManager.subscribeToChannel(ws.id, 'alerts:all');
    }
    
    sendMessage(ws, {
      type: 'AUTH_SUCCESS',
      payload: {
        clientId: ws.id,
        clientType: ws.clientType,
        userId: ws.userId,
        subscriptions: Array.from(ws.subscriptions),
      },
    });
    
    console.log(`[Auth] Client authenticated: ${ws.id} (${ws.clientType}, ${ws.userId || ws.serviceType})`);
  } else {
    sendMessage(ws, {
      type: 'AUTH_ERROR',
      payload: { error: result.error },
    });
  }
};

/**
 * Handle channel subscription
 */
const handleSubscribe = (ws: ExtendedWebSocket, message: SubscribeMessage): void => {
  if (!ws.userId && ws.clientType !== 'service') {
    sendError(ws, 'Authentication required');
    return;
  }
  
  const { channels } = message.payload;
  
  channels.forEach(channel => {
    // Security: Users can only subscribe to their own channels
    if (ws.clientType === 'user') {
      if (channel.includes(':') && !channel.endsWith(ws.userId!)) {
        console.log(`[Subscribe] Denied: ${ws.id} tried to subscribe to ${channel}`);
        return;
      }
    }
    
    clientManager.subscribeToChannel(ws.id, channel);
  });
  
  sendMessage(ws, {
    type: 'SUBSCRIBE',
    payload: { 
      subscribed: channels,
      allSubscriptions: Array.from(ws.subscriptions),
    },
  });
};

/**
 * Handle channel unsubscription
 */
const handleUnsubscribe = (ws: ExtendedWebSocket, message: SubscribeMessage): void => {
  const { channels } = message.payload;
  
  channels.forEach(channel => {
    clientManager.unsubscribeFromChannel(ws.id, channel);
  });
  
  sendMessage(ws, {
    type: 'UNSUBSCRIBE',
    payload: { 
      unsubscribed: channels,
      allSubscriptions: Array.from(ws.subscriptions),
    },
  });
};

/**
 * Handle ping (keep-alive)
 */
const handlePing = (ws: ExtendedWebSocket): void => {
  ws.isAlive = true;
  sendMessage(ws, { type: 'PONG' });
};

/**
 * Handle order events (from user-be or admin-be)
 */
const handleOrderEvent = (ws: ExtendedWebSocket, message: WSMessage): void => {
  // Only service clients can emit order events
  if (ws.clientType !== 'service') {
    sendError(ws, 'Unauthorized');
    return;
  }
  
  const { userId, orderId } = message.payload;
  
  // Send to the specific user
  if (userId) {
    clientManager.sendToUser(userId, JSON.stringify({
      ...message,
      timestamp: new Date().toISOString(),
      messageId: uuidv4(),
    }));
  }
  
  // Also send to admin channel
  clientManager.sendToChannel('admin:all', JSON.stringify({
    ...message,
    timestamp: new Date().toISOString(),
    messageId: uuidv4(),
  }));
  
  // Relay to other service if needed
  if (ws.serviceType === 'user-be') {
    clientManager.sendToService('admin-be', JSON.stringify(message));
  }
  
  console.log(`[OrderEvent] ${message.type} for order ${orderId}`);
};

/**
 * Handle batch events (from admin-be)
 */
const handleBatchEvent = (ws: ExtendedWebSocket, message: WSMessage): void => {
  if (ws.clientType !== 'service') {
    sendError(ws, 'Unauthorized');
    return;
  }
  
  // Broadcast to all admin clients
  clientManager.sendToChannel('admin:all', JSON.stringify({
    ...message,
    timestamp: new Date().toISOString(),
    messageId: uuidv4(),
  }));
  
  // For recalls, also notify user-be
  if (message.type === 'BATCH_RECALLED') {
    clientManager.sendToService('user-be', JSON.stringify(message));
  }
  
  console.log(`[BatchEvent] ${message.type} for batch ${message.payload.batchId}`);
};

/**
 * Handle fraud alerts
 */
const handleFraudAlert = (ws: ExtendedWebSocket, message: WSMessage): void => {
  if (ws.clientType !== 'service') {
    sendError(ws, 'Unauthorized');
    return;
  }
  
  // Send to all admin clients
  clientManager.sendToChannel('alerts:all', JSON.stringify({
    ...message,
    timestamp: new Date().toISOString(),
    messageId: uuidv4(),
  }));
  
  // Also notify the other service
  if (ws.serviceType === 'admin-be') {
    clientManager.sendToService('user-be', JSON.stringify(message));
  } else {
    clientManager.sendToService('admin-be', JSON.stringify(message));
  }
  
  console.log(`[FraudAlert] ${message.payload.alertType} - ${message.payload.severity}`);
};

/**
 * Handle notifications
 */
const handleNotification = (ws: ExtendedWebSocket, message: WSMessage): void => {
  if (ws.clientType !== 'service' && ws.userRole !== 'ADMIN') {
    sendError(ws, 'Unauthorized');
    return;
  }
  
  const { targetUsers, targetRoles } = message.payload;
  
  const notification = {
    ...message,
    timestamp: new Date().toISOString(),
    messageId: uuidv4(),
  };
  
  // Send to specific users
  if (targetUsers && targetUsers.length > 0) {
    if (targetUsers.includes('all')) {
      clientManager.broadcast(JSON.stringify(notification));
    } else {
      targetUsers.forEach((userId: string) => {
        clientManager.sendToUser(userId, JSON.stringify(notification));
      });
    }
  }
  
  // Send to users with specific roles
  if (targetRoles && targetRoles.length > 0) {
    targetRoles.forEach((role: string) => {
      const clients = clientManager.getClientsByRole(role);
      clients.forEach(client => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify(notification));
        }
      });
    });
  }
  
  console.log(`[Notification] Sent to ${targetUsers?.length || 0} users, ${targetRoles?.length || 0} roles`);
};

/**
 * Handle broadcast (from services)
 */
const handleBroadcast = (ws: ExtendedWebSocket, message: WSMessage): void => {
  if (ws.clientType !== 'service') {
    sendError(ws, 'Unauthorized');
    return;
  }
  
  clientManager.broadcast(JSON.stringify({
    ...message,
    timestamp: new Date().toISOString(),
    messageId: uuidv4(),
  }), ws.id);
  
  console.log(`[Broadcast] Message sent to all clients`);
};

/**
 * Send message to client
 */
const sendMessage = (ws: ExtendedWebSocket, message: WSMessage): void => {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify({
      ...message,
      timestamp: new Date().toISOString(),
      messageId: uuidv4(),
    }));
  }
};

/**
 * Send error to client
 */
const sendError = (ws: ExtendedWebSocket, error: string): void => {
  sendMessage(ws, {
    type: 'AUTH_ERROR',
    payload: { error },
  });
};

/**
 * Send rate limit error to client
 */
const sendRateLimitError = (ws: ExtendedWebSocket): void => {
  const remaining = rateLimiter.getRemaining(ws.id);
  const resetTime = rateLimiter.getResetTime(ws.id);
  
  sendMessage(ws, {
    type: 'RATE_LIMIT_ERROR' as any,
    payload: {
      error: 'Rate limit exceeded. Please slow down.',
      remaining,
      resetInMs: resetTime,
    },
  });
  
  console.log(`[RateLimit] Client ${ws.id} rate limited. Reset in ${resetTime}ms`);
};
