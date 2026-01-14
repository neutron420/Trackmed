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
};
