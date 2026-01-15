"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const database_1 = __importDefault(require("./config/database"));
const server_1 = require("./websocket/server");
const central_client_1 = require("./websocket/central-client");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'TrackMed Backend API',
    });
});
// Root API endpoint
app.get('/api', (req, res) => {
    res.json({
        success: true,
        service: 'TrackMed Backend API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/api/auth',
            batch: '/api/batch',
            scan: '/api/scan',
            fraud: '/api/fraud',
            manufacturer: '/api/manufacturer',
            medicine: '/api/medicine',
            qrCode: '/api/qr-code',
            lifecycle: '/api/lifecycle',
            distributor: '/api/distributor',
            pharmacy: '/api/pharmacy',
            analytics: '/api/analytics',
            user: '/api/user',
            batchSearch: '/api/batch-search',
            inventory: '/api/inventory',
            auditTrail: '/api/audit-trail',
        },
    });
});
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const batch_routes_1 = __importDefault(require("./routes/batch.routes"));
const scan_routes_1 = __importDefault(require("./routes/scan.routes"));
const fraud_routes_1 = __importDefault(require("./routes/fraud.routes"));
const manufacturer_routes_1 = __importDefault(require("./routes/manufacturer.routes"));
const medicine_routes_1 = __importDefault(require("./routes/medicine.routes"));
const qr_code_routes_1 = __importDefault(require("./routes/qr-code.routes"));
const lifecycle_routes_1 = __importDefault(require("./routes/lifecycle.routes"));
const distributor_routes_1 = __importDefault(require("./routes/distributor.routes"));
const pharmacy_routes_1 = __importDefault(require("./routes/pharmacy.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const batch_search_routes_1 = __importDefault(require("./routes/batch-search.routes"));
const inventory_routes_1 = __importDefault(require("./routes/inventory.routes"));
const audit_trail_routes_1 = __importDefault(require("./routes/audit-trail.routes"));
app.use('/api/auth', auth_routes_1.default);
app.use('/api/batch', batch_routes_1.default);
app.use('/api/scan', scan_routes_1.default);
app.use('/api/fraud', fraud_routes_1.default);
app.use('/api/manufacturer', manufacturer_routes_1.default);
app.use('/api/medicine', medicine_routes_1.default);
app.use('/api/qr-code', qr_code_routes_1.default);
app.use('/api/lifecycle', lifecycle_routes_1.default);
app.use('/api/distributor', distributor_routes_1.default);
app.use('/api/pharmacy', pharmacy_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/user', user_routes_1.default);
app.use('/api/batch-search', batch_search_routes_1.default);
app.use('/api/inventory', inventory_routes_1.default);
app.use('/api/audit-trail', audit_trail_routes_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error',
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
    });
});
// Start server
async function startServer() {
    try {
        // Test database connection
        await database_1.default.$connect();
        console.log('Database connected');
        const httpServer = app.listen(PORT, async () => {
            console.log(`TrackMed Backend API running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
            console.log(`API endpoints: http://localhost:${PORT}/api`);
            console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
            console.log(`Solana RPC: ${process.env.SOLANA_RPC_URL || 'http://127.0.0.1:8899'} (localnet)`);
            console.log(`Program ID: 48BYj4BVCp7D3EByu6f9nW8uHaFuuFdwJozB7iLZPxhJ`);
            // Initialize connection to central WebSocket server
            try {
                await (0, central_client_1.initCentralWebSocket)();
                console.log('[Central WS] Connected to WebSocket server');
            }
            catch (error) {
                console.error('[Central WS] Failed to connect:', error);
                // Server continues running, WS will auto-reconnect
            }
        });
        (0, server_1.initializeWebSocketServer)(httpServer);
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    (0, server_1.closeWebSocketServer)();
    const centralWS = (0, central_client_1.getCentralWSClient)();
    if (centralWS)
        centralWS.disconnect();
    await database_1.default.$disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('\nShutting down gracefully...');
    (0, server_1.closeWebSocketServer)();
    const centralWS = (0, central_client_1.getCentralWSClient)();
    if (centralWS)
        centralWS.disconnect();
    await database_1.default.$disconnect();
    process.exit(0);
});
startServer();
//# sourceMappingURL=index.js.map