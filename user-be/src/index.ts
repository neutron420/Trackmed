import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { config } from './config';
import prisma from './config/database';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { initWebSocket } from './websocket';

// Import routes
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import scanRoutes from './routes/scan.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';

const app = express();

// Security middleware
app.use(helmet());

// CORS - allow mobile app origins
app.use(cors({
  origin: '*', // In production, restrict to your mobile app domains
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: 'Too many requests, please try again later',
  },
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'TrackMed User API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    service: 'TrackMed Consumer Mobile API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout',
        logoutAll: 'POST /api/auth/logout-all',
      },
      profile: {
        get: 'GET /api/profile',
        update: 'PUT /api/profile',
        changePassword: 'PUT /api/profile/password',
        delete: 'DELETE /api/profile',
        addresses: {
          list: 'GET /api/profile/addresses',
          add: 'POST /api/profile/addresses',
          update: 'PUT /api/profile/addresses/:id',
          delete: 'DELETE /api/profile/addresses/:id',
          setDefault: 'PATCH /api/profile/addresses/:id/default',
        },
      },
      scan: {
        scan: 'POST /api/scan',
        history: 'GET /api/scan/history',
        medicine: 'GET /api/scan/medicine/:id',
        batch: 'GET /api/scan/batch/:id',
        search: 'GET /api/scan/search?q=query',
      },
      cart: {
        get: 'GET /api/cart',
        count: 'GET /api/cart/count',
        addItem: 'POST /api/cart/items',
        updateItem: 'PUT /api/cart/items/:batchId',
        removeItem: 'DELETE /api/cart/items/:batchId',
        clear: 'DELETE /api/cart',
      },
      orders: {
        create: 'POST /api/orders',
        list: 'GET /api/orders',
        get: 'GET /api/orders/:id',
        track: 'GET /api/orders/:id/track',
        cancel: 'PATCH /api/orders/:id/cancel',
        initiatePayment: 'POST /api/orders/:id/payment',
        verifyPayment: 'POST /api/orders/payment/verify',
      },
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Received shutdown signal, closing connections...');
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const server = app.listen(config.port, async () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   TrackMed Consumer API                                    ║
║                                                            ║
║   Server running on port ${config.port}                            ║
║   Environment: ${config.nodeEnv.padEnd(41)}║
║                                                            ║
║   Health: http://localhost:${config.port}/health                   ║
║   API Info: http://localhost:${config.port}/api                    ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);

  // Initialize WebSocket connection to central server
  try {
    await initWebSocket();
    console.log('[WS] Connected to WebSocket server');
  } catch (error) {
    console.error('[WS] Failed to connect to WebSocket server:', error);
    // Server continues running, WS will auto-reconnect
  }
});

export default server;
