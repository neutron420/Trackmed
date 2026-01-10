const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    // Check if users already exist
    const existingUser = await prisma.user.findUnique({
      where: { id: 'user-123' }
    });

    const existingAdmin = await prisma.user.findUnique({
      where: { id: 'admin-456' }
    });

    const passwordHash = await bcrypt.hash('test123', 10);

    if (!existingUser) {
      const manufacturer = await prisma.user.create({
        data: {
          id: 'user-123',
          email: 'manufacturer@test.com',
          passwordHash: passwordHash,
          name: 'Test Manufacturer',
          role: 'MANUFACTURER',
          isActive: true,
        },
      });
      console.log('✓ Created MANUFACTURER user:', manufacturer.id);
    } else {
      console.log('✓ MANUFACTURER user already exists:', existingUser.id);
    }

    if (!existingAdmin) {
      const admin = await prisma.user.create({
        data: {
          id: 'admin-456',
          email: 'admin@test.com',
          passwordHash: passwordHash,
          name: 'Test Admin',
          role: 'ADMIN',
          isActive: true,
        },
      });
      console.log('✓ Created ADMIN user:', admin.id);
    } else {
      console.log('✓ ADMIN user already exists:', existingAdmin.id);
    }

    console.log('\n✓ Test users ready!');
    console.log('You can now use the JWT tokens from your .env file');
  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
