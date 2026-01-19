/**
 * Script to create a manufacturer record with your wallet address
 * 
 * Usage:
 *   1. Edit the manufacturer details below (name, licenseNumber, address, etc.)
 *   2. Run: node create-manufacturer.js (from services/admin-be directory)
 */

// Load environment variables
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function createManufacturer() {
  try {
    // Your wallet public key (from solana-keygen)
    const walletAddress = 'FVrjJvuka9aJdfvPthtdBg4KzDN7VXxShqFUu3r3qLcu';
    
    // Check if manufacturer already exists
    const existing = await prisma.manufacturer.findUnique({
      where: { walletAddress },
    });

    if (existing) {
      console.log('✅ Manufacturer already exists:');
      console.log(JSON.stringify(existing, null, 2));
      return;
    }

    // Create manufacturer record
    // TODO: Update these values with your actual manufacturer details
    const manufacturer = await prisma.manufacturer.create({
      data: {
        name: 'My Manufacturer Company', // Change this to your company name
        licenseNumber: 'LIC-' + Date.now(), // Change this to your actual license number
        address: '123 Manufacturing Street', // Change this to your address
        city: 'Mumbai', // Change this
        state: 'Maharashtra', // Change this
        country: 'India',
        phone: '+91-1234567890', // Optional
        email: 'manufacturer@example.com', // Optional
        gstNumber: '27AAAAA0000A1Z5', // Optional - change this
        walletAddress: walletAddress,
        isVerified: false, // Will be verified later by admin
      },
    });

    console.log('✅ Manufacturer created successfully!');
    console.log(JSON.stringify(manufacturer, null, 2));
    console.log('\n📝 You can now create batches using your wallet private key:');
    console.log('   2ZY66RJdDXMxtEL2PMJg5cnYJPrdiHfXv25Vi2v129uVFKJyFCRKGfrhwf4ZytKiK2vZP1NnsqfSjyaP87B7oCF7');
  } catch (error) {
    console.error('\n❌ Error creating manufacturer:');
    console.error('   Message:', error.message);
    
    if (error.code === 'P2002') {
      console.error('   This wallet address or license number already exists.');
    } else if (error.code === 'P1001') {
      console.error('   Cannot reach database server. Is PostgreSQL running?');
      console.error('   Check your DATABASE_URL in .env file');
    } else if (error.message && error.message.includes('address')) {
      console.error('   Database schema issue. Make sure migrations are up to date.');
      console.error('   Run: npm run prisma:migrate');
    }
    
    if (process.env.DEBUG) {
      console.error('\nFull error:', error);
    }
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed.');
  }
}

createManufacturer();
