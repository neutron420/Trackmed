const WebSocket = require('ws');
require('dotenv').config();

const token = process.argv[2] || process.env.JWT_TOKEN_USER;

if (!token) {
  console.log('Usage: node scripts/test-ws.js <jwt_token>');
  console.log('Or set JWT_TOKEN_USER in .env file');
  process.exit(1);
}

console.log('Connecting to ws://localhost:3000/ws...\n');

const ws = new WebSocket('ws://localhost:3000/ws');

ws.on('open', () => {
  console.log('✓ Connected to WebSocket');
  
  // Send AUTH message
  const authMessage = {
    type: 'AUTH',
    payload: { token: token }
  };
  
  console.log('Sending AUTH message...');
  ws.send(JSON.stringify(authMessage));
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  console.log('\n✓ Received:', JSON.stringify(message, null, 2));
  
  if (message.type === 'AUTH' && message.payload?.success) {
    console.log('\n✓ Authentication successful!');
    console.log('Role:', message.payload.role);
    
    if (message.payload.role === 'MANUFACTURER') {
      console.log('\nYou can now send LOCATION messages.');
      console.log('Example: Send location update in 3 seconds...\n');
      
      setTimeout(() => {
        const locationMessage = {
          type: 'LOCATION',
          payload: {
            batchId: 'test-batch-123',
            warehouseId: 'warehouse-456',
            lat: 28.6139,
            lng: 77.2090,
            timestamp: new Date().toISOString()
          }
        };
        console.log('Sending LOCATION message...');
        ws.send(JSON.stringify(locationMessage));
      }, 3000);
    } else if (message.payload.role === 'ADMIN') {
      console.log('\n✓ Waiting for LOCATION messages from MANUFACTURER users...');
      console.log('(Keep this connection open to receive updates)');
    } else if (message.payload.role === 'MANUFACTURER') {
      console.log('\n✓ Connected as MANUFACTURER');
      console.log('Waiting for LOCATION send confirmation and CHAT messages...');
    }
  } else if (message.type === 'LOCATION') {
    console.log('\n✓ Received LOCATION update!');
  } else if (message.type === 'CHAT_RECEIVED') {
    console.log('\n✓ Received CHAT message:');
    console.log('From:', message.payload.senderName, `(${message.payload.senderRole})`);
    console.log('Message:', message.payload.message);
    if (message.payload.recipientId) {
      console.log('(Private message)');
    } else {
      console.log('(Broadcast message)');
    }
  } else if (message.type === 'ERROR') {
    console.log('\n✗ Error:', message.error);
  }
});

ws.on('error', (error) => {
  console.error('\n✗ WebSocket error:', error.message);
  console.log('Make sure your server is running: npm run dev');
});

ws.on('close', () => {
  console.log('\n✗ Disconnected from WebSocket');
  process.exit(0);
});

// Keep process alive
process.on('SIGINT', () => {
  console.log('\n\nClosing connection...');
  ws.close();
});
