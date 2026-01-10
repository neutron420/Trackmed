const WebSocket = require('ws');
require('dotenv').config();

const token = process.argv[2] || process.env.JWT_TOKEN_USER;

// Get location data from command line or use defaults
const batchId = process.argv[3] || 'batch-123';
const lat = parseFloat(process.argv[4]) || 28.6139;
const lng = parseFloat(process.argv[5]) || 77.2090;
const warehouseId = process.argv[6] || 'warehouse-456';

if (!token) {
  console.log('Usage: node scripts/send-location.js [token] [batchId] [lat] [lng] [warehouseId]');
  console.log('Example: node scripts/send-location.js <token> batch-789 28.7041 77.1025 warehouse-123');
  process.exit(1);
}

console.log('Connecting to WebSocket...\n');

const ws = new WebSocket('ws://localhost:3000/ws');

ws.on('open', () => {
  console.log('✓ Connected');
  
  // Authenticate first
  ws.send(JSON.stringify({
    type: 'AUTH',
    payload: { token: token }
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  
  if (message.type === 'AUTH' && message.payload?.success) {
    console.log('✓ Authenticated as:', message.payload.role);
    
    if (message.payload.role !== 'MANUFACTURER') {
      console.error('✗ Error: Only MANUFACTURER users can send locations');
      ws.close();
      return;
    }
    
    // Send location message
    const locationMessage = {
      type: 'LOCATION',
      payload: {
        batchId: batchId,
        warehouseId: warehouseId,
        lat: lat,
        lng: lng,
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('\nSending location:');
    console.log(JSON.stringify(locationMessage, null, 2));
    
    ws.send(JSON.stringify(locationMessage));
    
    setTimeout(() => {
      console.log('\n✓ Location sent successfully');
      ws.close();
    }, 1000);
    
  } else if (message.type === 'ERROR') {
    console.error('✗ Error:', message.error);
    ws.close();
  }
});

ws.on('error', (error) => {
  console.error('✗ WebSocket error:', error.message);
});

ws.on('close', () => {
  process.exit(0);
});
