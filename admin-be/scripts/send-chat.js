const WebSocket = require('ws');
require('dotenv').config();

const token = process.argv[2] || process.env.JWT_TOKEN_USER;
const chatMessageText = process.argv[3] || 'Hello from chat!';
const recipientId = process.argv[4]; // Optional: for private messages

if (!token) {
  console.log('Usage: node scripts/send-chat.js [token] [message] [recipientId]');
  console.log('Example: node scripts/send-chat.js <token> "Hello!" admin-456');
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
    
    if (message.payload.role !== 'ADMIN' && message.payload.role !== 'MANUFACTURER') {
      console.error('✗ Error: Only ADMIN and MANUFACTURER users can chat');
      ws.close();
      return;
    }
    
    // Send chat message
    const chatMessage = {
      type: 'CHAT',
      payload: {
        message: chatMessageText,
        recipientId: recipientId,
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('\nSending chat message:');
    console.log(JSON.stringify(chatMessage, null, 2));
    
    ws.send(JSON.stringify(chatMessage));
    
    setTimeout(() => {
      console.log('\n✓ Chat message sent');
      ws.close();
    }, 1000);
    
  } else if (message.type === 'CHAT_RECEIVED') {
    console.log('\n✓ Received chat:', JSON.stringify(message, null, 2));
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
