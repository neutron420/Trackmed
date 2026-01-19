/**
 * Test script to verify the wallet private key format
 */

const bs58 = require('bs58');
const { Keypair } = require('@solana/web3.js');

const privateKey = '2ZY66RJdDXMxtEL2PMJg5cnYJPrdiHfXv25Vi2v129uVFKJyFCRKGfrhwf4ZytKiK2vZP1NnsqfSjyaP87B7oCF7';

console.log('Testing private key format...');
console.log('Key length:', privateKey.length);
console.log('Key (first 20 chars):', privateKey.substring(0, 20) + '...');

try {
  console.log('\n1. Testing bs58.decode...');
  const decoded = bs58.decode(privateKey);
  console.log('   ✅ Decoded successfully!');
  console.log('   Decoded length:', decoded.length, 'bytes');
  
  if (decoded.length !== 64) {
    console.log('   ⚠️  Warning: Expected 64 bytes, got', decoded.length);
  }
  
  console.log('\n2. Testing Keypair.fromSecretKey...');
  const keypair = Keypair.fromSecretKey(decoded);
  console.log('   ✅ Keypair created successfully!');
  console.log('   Public key:', keypair.publicKey.toBase58());
  console.log('   Expected public key: FVrjJvuka9aJdfvPthtdBg4KzDN7VXxShqFUu3r3qLcu');
  
  if (keypair.publicKey.toBase58() === 'FVrjJvuka9aJdfvPthtdBg4KzDN7VXxShqFUu3r3qLcu') {
    console.log('   ✅ Public key matches!');
  } else {
    console.log('   ❌ Public key mismatch!');
  }
  
} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error('Stack:', error.stack);
}
