// Use Prisma client from admin-be (shared schema)
import { PrismaClient } from '../../../admin-be/node_modules/@prisma/client';

const prisma: any = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
