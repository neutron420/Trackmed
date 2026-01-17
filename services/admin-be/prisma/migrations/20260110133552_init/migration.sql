-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'MANUFACTURER', 'DISTRIBUTOR', 'PHARMACY', 'SCANNER', 'CONSUMER');

-- CreateEnum
CREATE TYPE "public"."BatchStatus" AS ENUM ('VALID', 'RECALLED');

-- CreateEnum
CREATE TYPE "public"."LifecycleStatus" AS ENUM ('IN_PRODUCTION', 'IN_TRANSIT', 'AT_DISTRIBUTOR', 'AT_PHARMACY', 'SOLD', 'EXPIRED', 'RECALLED');

-- CreateEnum
CREATE TYPE "public"."ScanType" AS ENUM ('VERIFICATION', 'PURCHASE', 'DISTRIBUTION', 'RECALL_CHECK');

-- CreateEnum
CREATE TYPE "public"."FraudAlertType" AS ENUM ('DUPLICATE_QR_CODE', 'INVALID_BATCH_HASH', 'EXPIRED_MEDICINE', 'RECALLED_BATCH', 'LOCATION_MISMATCH', 'FREQUENT_SCANS', 'UNAUTHORIZED_ACCESS', 'BLOCKCHAIN_MISMATCH');

-- CreateEnum
CREATE TYPE "public"."FraudSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'SCANNER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."manufacturers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "license_number" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "phone" TEXT,
    "email" TEXT,
    "gst_number" TEXT,
    "wallet_address" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manufacturers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."medicines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "generic_name" TEXT,
    "strength" TEXT NOT NULL,
    "composition" TEXT NOT NULL,
    "dosage_form" TEXT NOT NULL,
    "mrp" DECIMAL(10,2) NOT NULL,
    "storage_condition" TEXT,
    "image_url" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."batches" (
    "id" TEXT NOT NULL,
    "batch_hash" TEXT NOT NULL,
    "manufacturing_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "status" "public"."BatchStatus" NOT NULL DEFAULT 'VALID',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "blockchain_tx_hash" TEXT,
    "blockchain_pda" TEXT,
    "batch_number" TEXT NOT NULL,
    "manufacturer_id" TEXT NOT NULL,
    "medicine_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "invoice_number" TEXT,
    "invoice_date" TIMESTAMP(3),
    "gst_number" TEXT,
    "warehouse_location" TEXT,
    "warehouse_address" TEXT,
    "lifecycle_status" "public"."LifecycleStatus" NOT NULL DEFAULT 'IN_PRODUCTION',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."qr_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "unit_number" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."scan_logs" (
    "id" TEXT NOT NULL,
    "qr_code_id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "user_id" TEXT,
    "device_id" TEXT,
    "device_model" TEXT,
    "device_os" TEXT,
    "app_version" TEXT,
    "location_lat" DECIMAL(10,8),
    "location_lng" DECIMAL(10,8),
    "location_address" TEXT,
    "scan_type" "public"."ScanType" NOT NULL DEFAULT 'VERIFICATION',
    "blockchain_verified" BOOLEAN NOT NULL DEFAULT false,
    "blockchain_status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scan_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."fraud_alerts" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT,
    "qr_code_id" TEXT,
    "user_id" TEXT,
    "alert_type" "public"."FraudAlertType" NOT NULL,
    "severity" "public"."FraudSeverity" NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT NOT NULL,
    "evidence" JSONB,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "resolved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fraud_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."analytics" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "metric_type" TEXT NOT NULL,
    "metric_value" DECIMAL(15,2) NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "manufacturers_license_number_key" ON "public"."manufacturers"("license_number");

-- CreateIndex
CREATE UNIQUE INDEX "manufacturers_wallet_address_key" ON "public"."manufacturers"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "batches_batch_hash_key" ON "public"."batches"("batch_hash");

-- CreateIndex
CREATE UNIQUE INDEX "batches_blockchain_tx_hash_key" ON "public"."batches"("blockchain_tx_hash");

-- CreateIndex
CREATE UNIQUE INDEX "batches_blockchain_pda_key" ON "public"."batches"("blockchain_pda");

-- CreateIndex
CREATE UNIQUE INDEX "batches_batch_number_key" ON "public"."batches"("batch_number");

-- CreateIndex
CREATE INDEX "batches_batch_hash_idx" ON "public"."batches"("batch_hash");

-- CreateIndex
CREATE INDEX "batches_manufacturer_id_idx" ON "public"."batches"("manufacturer_id");

-- CreateIndex
CREATE INDEX "batches_medicine_id_idx" ON "public"."batches"("medicine_id");

-- CreateIndex
CREATE INDEX "batches_blockchain_tx_hash_idx" ON "public"."batches"("blockchain_tx_hash");

-- CreateIndex
CREATE UNIQUE INDEX "qr_codes_code_key" ON "public"."qr_codes"("code");

-- CreateIndex
CREATE INDEX "qr_codes_code_idx" ON "public"."qr_codes"("code");

-- CreateIndex
CREATE INDEX "qr_codes_batch_id_idx" ON "public"."qr_codes"("batch_id");

-- CreateIndex
CREATE INDEX "scan_logs_qr_code_id_idx" ON "public"."scan_logs"("qr_code_id");

-- CreateIndex
CREATE INDEX "scan_logs_batch_id_idx" ON "public"."scan_logs"("batch_id");

-- CreateIndex
CREATE INDEX "scan_logs_user_id_idx" ON "public"."scan_logs"("user_id");

-- CreateIndex
CREATE INDEX "scan_logs_created_at_idx" ON "public"."scan_logs"("created_at");

-- CreateIndex
CREATE INDEX "fraud_alerts_batch_id_idx" ON "public"."fraud_alerts"("batch_id");

-- CreateIndex
CREATE INDEX "fraud_alerts_qr_code_id_idx" ON "public"."fraud_alerts"("qr_code_id");

-- CreateIndex
CREATE INDEX "fraud_alerts_is_resolved_idx" ON "public"."fraud_alerts"("is_resolved");

-- CreateIndex
CREATE INDEX "fraud_alerts_created_at_idx" ON "public"."fraud_alerts"("created_at");

-- CreateIndex
CREATE INDEX "analytics_date_idx" ON "public"."analytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_date_metric_type_key" ON "public"."analytics"("date", "metric_type");

-- AddForeignKey
ALTER TABLE "public"."batches" ADD CONSTRAINT "batches_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "public"."manufacturers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."batches" ADD CONSTRAINT "batches_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "public"."medicines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."qr_codes" ADD CONSTRAINT "qr_codes_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scan_logs" ADD CONSTRAINT "scan_logs_qr_code_id_fkey" FOREIGN KEY ("qr_code_id") REFERENCES "public"."qr_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scan_logs" ADD CONSTRAINT "scan_logs_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."scan_logs" ADD CONSTRAINT "scan_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fraud_alerts" ADD CONSTRAINT "fraud_alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
