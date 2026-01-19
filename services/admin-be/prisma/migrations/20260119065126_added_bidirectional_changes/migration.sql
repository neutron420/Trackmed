-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'BATCH_STATUS_CHANGED';
ALTER TYPE "NotificationType" ADD VALUE 'MANUFACTURER_OPERATION';
ALTER TYPE "NotificationType" ADD VALUE 'ADMIN_ACTION';
ALTER TYPE "NotificationType" ADD VALUE 'MANUFACTURER_VERIFIED';
ALTER TYPE "NotificationType" ADD VALUE 'MANUFACTURER_UPDATED';
