import dotenv from 'dotenv';
dotenv.config();

export const config = {
  wsPort: parseInt(process.env.WS_PORT || '3003', 10),
  httpPort: parseInt(process.env.HTTP_PORT || '3004', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  jwt: {
    userSecret: process.env.JWT_SECRET_USER || 'user-secret',
    adminSecret: process.env.JWT_SECRET_ADMIN || 'admin-secret',
  },
  
  serviceKeys: {
    adminBe: process.env.ADMIN_BE_SERVICE_KEY || 'admin-service-key',
    userBe: process.env.USER_BE_SERVICE_KEY || 'user-service-key',
  },
  
  backendUrls: {
    admin: process.env.ADMIN_BE_URL || 'http://localhost:3000',
    user: process.env.USER_BE_URL || 'http://localhost:3001',
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxMessages: parseInt(process.env.RATE_LIMIT_MAX_MESSAGES || '100', 10),
  },

  // Connection limits
  connectionLimits: {
    maxPerUser: parseInt(process.env.MAX_CONNECTIONS_PER_USER || '5', 10),
    maxTotal: parseInt(process.env.MAX_TOTAL_CONNECTIONS || '1000', 10),
  },

  // Heartbeat
  heartbeat: {
    intervalMs: parseInt(process.env.HEARTBEAT_INTERVAL_MS || '30000', 10),
    timeoutMs: parseInt(process.env.HEARTBEAT_TIMEOUT_MS || '60000', 10),
  },
};
