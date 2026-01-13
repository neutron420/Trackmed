import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'http';
dotenv.config();
import prisma from './config/database';
import { initializeWebSocketServer, closeWebSocketServer } from './websocket/server';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'TrackMed Backend API',
  });
});

// API Routes
import authRoutes from './routes/auth.routes';
import batchRoutes from './routes/batch.routes';
import scanRoutes from './routes/scan.routes';
import fraudRoutes from './routes/fraud.routes';
import manufacturerRoutes from './routes/manufacturer.routes';
import medicineRoutes from './routes/medicine.routes';
import qrCodeRoutes from './routes/qr-code.routes';
import lifecycleRoutes from './routes/lifecycle.routes';
import distributorRoutes from './routes/distributor.routes';
import pharmacyRoutes from './routes/pharmacy.routes';
import analyticsRoutes from './routes/analytics.routes';
import userRoutes from './routes/user.routes';
import batchSearchRoutes from './routes/batch-search.routes';
import inventoryRoutes from './routes/inventory.routes';
import auditTrailRoutes from './routes/audit-trail.routes';

app.use('/api/auth', authRoutes);
app.use('/api/batch', batchRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/fraud', fraudRoutes);
app.use('/api/manufacturer', manufacturerRoutes);
app.use('/api/medicine', medicineRoutes);
app.use('/api/qr-code', qrCodeRoutes);
app.use('/api/lifecycle', lifecycleRoutes);
app.use('/api/distributor', distributorRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/batch-search', batchSearchRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/audit-trail', auditTrailRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Start server
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connected');

    const httpServer = app.listen(PORT, () => {
      console.log(`TrackMed Backend API running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API endpoints: http://localhost:${PORT}/api`);
      console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
      console.log(`Solana RPC: ${process.env.SOLANA_RPC_URL || 'http://127.0.0.1:8899'} (localnet)`);
      console.log(`Program ID: 48BYj4BVCp7D3EByu6f9nW8uHaFuuFdwJozB7iLZPxhJ`);
    });

    initializeWebSocketServer(httpServer);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  closeWebSocketServer();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  closeWebSocketServer();
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
