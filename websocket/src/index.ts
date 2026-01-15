import express from 'express';
import http from 'http';
import WebSocket, { WebSocketServer, RawData } from 'ws';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { config } from './config';
import { ExtendedWebSocket } from './types';
import { clientManager } from './client-manager';
import { handleMessage } from './handlers';
import { rateLimiter } from './rate-limiter';


// Create Express app for health checks
const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'TrackMed WebSocket Server',
    timestamp: new Date().toISOString(),
    stats: clientManager.getStats(),
  });
});

// Stats endpoint
app.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      ...clientManager.getStats(),
      rateLimit: rateLimiter.getStats(),
      limits: {
        maxConnectionsPerUser: config.connectionLimits.maxPerUser,
        maxTotalConnections: config.connectionLimits.maxTotal,
        rateLimitWindowMs: config.rateLimit.windowMs,
        rateLimitMaxMessages: config.rateLimit.maxMessages,
      },
    },
  });
});

// Create HTTP server
const httpServer = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ 
  port: config.wsPort,
  perMessageDeflate: false,
});

console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   TrackMed WebSocket Server                                ║
║                                                            ║
║   WebSocket: ws://localhost:${config.wsPort}               ║
║   HTTP Health: http://localhost:${config.httpPort}/health  ║
║   Environment: ${config.nodeEnv.padEnd(41)}║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);

// Connection handler
wss.on('connection', (ws: WebSocket) => {
  // Extend WebSocket with custom properties
  const extWs = ws as ExtendedWebSocket;
  extWs.id = uuidv4();
  extWs.clientType = 'user'; // Default, will be set on auth
  extWs.isAlive = true;
  extWs.subscriptions = new Set();
  
  console.log(`[WS] New connection: ${extWs.id}`);
  
  // Send welcome message with connection ID
  extWs.send(JSON.stringify({
    type: 'CONNECTED',
    payload: {
      connectionId: extWs.id,
      message: 'Connected to TrackMed WebSocket. Please authenticate.',
    },
    timestamp: new Date().toISOString(),
  }));
  
  // Message handler
  extWs.on('message', (data: RawData) => {
    handleMessage(extWs, data.toString());
  });
  
  // Pong handler (for heartbeat)
  extWs.on('pong', () => {
    extWs.isAlive = true;
  });
  
  // Close handler
  extWs.on('close', () => {
    console.log(`[WS] Connection closed: ${extWs.id}`);
    clientManager.removeClient(extWs.id);
  });
  
  // Error handler
  extWs.on('error', (error) => {
    console.error(`[WS] Error for ${extWs.id}:`, error);
    clientManager.removeClient(extWs.id);
  });
});

// Heartbeat interval (check every 30 seconds)
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    const extWs = ws as ExtendedWebSocket;
    
    if (extWs.isAlive === false) {
      console.log(`[Heartbeat] Terminating inactive client: ${extWs.id}`);
      clientManager.removeClient(extWs.id);
      rateLimiter.removeClient(extWs.id);
      return extWs.terminate();
    }
    
    extWs.isAlive = false;
    extWs.ping();
  });
}, config.heartbeat.intervalMs);

// Cleanup on server close
wss.on('close', () => {
  clearInterval(heartbeatInterval);
});

// Start HTTP server for health checks
httpServer.listen(config.httpPort, () => {
  console.log(`[HTTP] Health check server running on port ${config.httpPort}`);
});

// Graceful shutdown
let isShuttingDown = false;

const gracefulShutdown = (signal: string) => {
  if (isShuttingDown) {
    console.log('[WS] Shutdown already in progress...');
    return;
  }
  
  isShuttingDown = true;
  console.log(`\n[WS] Received ${signal}. Starting graceful shutdown...`);
  
  // Stop accepting new connections
  wss.close(() => {
    console.log('[WS] WebSocket server closed');
  });

  // Notify all clients and close connections
  const closePromises: Promise<void>[] = [];
  
  wss.clients.forEach((ws) => {
    const extWs = ws as ExtendedWebSocket;
    
    // Send shutdown notification
    try {
      ws.send(JSON.stringify({
        type: 'SERVER_SHUTDOWN',
        payload: { message: 'Server is shutting down. Please reconnect shortly.' },
        timestamp: new Date().toISOString(),
      }));
    } catch (e) {
      // Ignore send errors during shutdown
    }
    
    // Close with proper code
    closePromises.push(new Promise((resolve) => {
      ws.close(1001, 'Server shutting down');
      ws.once('close', () => {
        clientManager.removeClient(extWs.id);
        rateLimiter.removeClient(extWs.id);
        resolve();
      });
      
      // Force close after timeout
      setTimeout(() => {
        if (ws.readyState !== WebSocket.CLOSED) {
          ws.terminate();
        }
        resolve();
      }, 5000);
    }));
  });

  // Wait for all connections to close (with timeout)
  Promise.all(closePromises).then(() => {
    clearInterval(heartbeatInterval);
    rateLimiter.stop();
    
    httpServer.close(() => {
      console.log('[HTTP] Health check server closed');
      console.log('[WS] Graceful shutdown complete');
      process.exit(0);
    });
    
    // Force exit after timeout
    setTimeout(() => {
      console.log('[WS] Forcing shutdown after timeout');
      process.exit(1);
    }, 10000);
  });
};

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[FATAL] Uncaught exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled rejection at:', promise, 'reason:', reason);
});

export { wss, httpServer };
