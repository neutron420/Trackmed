/**
 * Script to create a manufacturer record with your wallet address
 * 
 * Usage:
 *   1. Edit the manufacturer details below (name, licenseNumber, address, etc.)
 *   2. Run: cd services/admin-be && node ../../create-manufacturer.js
 */

// Change to admin-be directory to use its Prisma client
const path = require('path');
const fs = require('fs');

// Get the admin-be directory path
const adminBeDir = path.join(__dirname, 'services/admin-be');

// Change to admin-be directory
process.chdir(adminBeDir);

// Now require Prisma from the admin-be directory
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

    console.log(' Manufacturer created successfully!');
    console.log(JSON.stringify(manufacturer, null, 2));
    console.log('\n You can now create batches using your wallet private key.');
  } catch (error) {
    console.error(' Error creating manufacturer:', error.message);
    if (error.code === 'P2002') {
      console.error('   This wallet address or license number already exists.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

createManufacturer();
