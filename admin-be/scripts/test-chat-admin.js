const WebSocket = require('ws');
require('dotenv').config();

const token = process.argv[2] || process.env.JWT_TOKEN_ADMIN;
const chatMessage = process.argv[3] || 'Hello MANUFACTURER!';
const recipientId = process.argv[4] || 'user-123'; // MANUFACTURER user ID

if (!token) {
  console.log('Usage: node scripts/test-chat-admin.js [token] [message] [recipientId]');
  console.log('Example: node scripts/test-chat-admin.js <token> "Hello!" user-123');
  process.exit(1);
}

console.log('Connecting as ADMIN to send chat...\n');

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
    
    if (message.payload.role !== 'ADMIN') {
      console.error('✗ Error: This script is for ADMIN users only');
      ws.close();
      return;
    }
    
    // Wait a moment, then send chat message
    setTimeout(() => {
      const chatMsg = {
        type: 'CHAT',
        payload: {
          message: chatMessage,
          recipientId: recipientId,
          timestamp: new Date().toISOString()
        }
      };
      
      console.log('\nSending chat to MANUFACTURER:', recipientId);
      console.log('Message:', chatMessage);
      ws.send(JSON.stringify(chatMsg));
      
      setTimeout(() => {
        console.log('\n✓ Chat message sent!');
        console.log('Check MANUFACTURER terminal to see if they received it.');
        ws.close();
      }, 1000);
    }, 500);
    
  } else if (message.type === 'CHAT_RECEIVED') {
    console.log('\n✓ Received chat response:', JSON.stringify(message, null, 2));
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
