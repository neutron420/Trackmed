-- CreateIndex
CREATE INDEX "addresses_is_default_idx" ON "addresses"("is_default");

-- CreateIndex
CREATE INDEX "batches_status_idx" ON "batches"("status");

-- CreateIndex
CREATE INDEX "batches_expiry_date_idx" ON "batches"("expiry_date");

-- CreateIndex
CREATE INDEX "batches_created_at_idx" ON "batches"("created_at");

-- CreateIndex
CREATE INDEX "batches_batch_number_idx" ON "batches"("batch_number");

-- CreateIndex
CREATE INDEX "distributors_name_idx" ON "distributors"("name");

-- CreateIndex
CREATE INDEX "distributors_is_verified_idx" ON "distributors"("is_verified");

-- CreateIndex
CREATE INDEX "distributors_created_at_idx" ON "distributors"("created_at");

-- CreateIndex
CREATE INDEX "manufacturers_name_idx" ON "manufacturers"("name");

-- CreateIndex
CREATE INDEX "manufacturers_wallet_address_idx" ON "manufacturers"("wallet_address");

-- CreateIndex
CREATE INDEX "manufacturers_is_verified_idx" ON "manufacturers"("is_verified");

-- CreateIndex
CREATE INDEX "manufacturers_created_at_idx" ON "manufacturers"("created_at");

-- CreateIndex
CREATE INDEX "medicines_name_idx" ON "medicines"("name");

-- CreateIndex
CREATE INDEX "medicines_generic_name_idx" ON "medicines"("generic_name");

-- CreateIndex
CREATE INDEX "medicines_created_at_idx" ON "medicines"("created_at");

-- CreateIndex
CREATE INDEX "pharmacies_name_idx" ON "pharmacies"("name");

-- CreateIndex
CREATE INDEX "pharmacies_is_verified_idx" ON "pharmacies"("is_verified");

-- CreateIndex
CREATE INDEX "pharmacies_created_at_idx" ON "pharmacies"("created_at");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "refresh_tokens_is_revoked_idx" ON "refresh_tokens"("is_revoked");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");
