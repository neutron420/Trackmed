// Quick test script to check chat history API
const jwt = require('jsonwebtoken');

// Create a valid test token
const token = jwt.sign(
  { userId: 'cmkqf1asu0000uo660rgbvcjv', role: 'ADMIN' },
  'trackmed-admin-secret-key-2026',
  { expiresIn: '1h' }
);

console.log('Test token:', token);

// Test the API
fetch('http://localhost:3000/api/chat/history?limit=50', {
  headers: { Authorization: `Bearer ${token}` }
})
.then(res => res.json())
.then(data => {
  console.log('API Response:', JSON.stringify(data, null, 2));
})
.catch(err => console.error('Error:', err));
