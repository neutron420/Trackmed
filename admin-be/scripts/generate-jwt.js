const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const userId = process.argv[2] || 'test-user-id';
const role = process.argv[3] || 'MANUFACTURER';

const payload = {
  userId: userId,
  role: role,
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

console.log('JWT Token:');
console.log(token);
console.log('\nPayload:');
console.log(JSON.stringify(payload, null, 2));
