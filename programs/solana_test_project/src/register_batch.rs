use anchor_lang::prelude::*;
use crate::state::{BatchStatus, DosageForm, StorageCondition, PhysicalCondition};
use crate::error::ErrorCode;
use crate::events::BatchRegistered;
use crate::RegisterBatch;

pub fn handler(
    ctx: Context<RegisterBatch>,
    // 1. Medicine Name
    brand_name: String,
    generic_name: String,
    // 2. Batch Number
    batch_id: String,
    // 3. Manufacturing Date (MFG)
    manufacturing_date: i64,
    // 4. Expiry Date (EXP)
    expiry_date: i64,
    // 5. MRP (Maximum Retail Price)
    mrp: u64,
    // 6. Quantity Received
    quantity_received: u32,
    // 7. Dosage Form
    dosage_form: DosageForm,
    // 8. Strength & Composition
    strength: String,
    composition: String,
    // 9. Manufacturer Details
    manufacturer_name: String,
    manufacturer_license: String,
    manufacturer_address: String,
    // 10. Storage Conditions
    storage_condition: StorageCondition,
    // 11. Physical Condition
    physical_condition: PhysicalCondition,
    // 12. Invoice & GST Details
    invoice_number: String,
    invoice_date: i64,
    gst_number: String,
) -> Result<()> {
    // Validation: 1. Medicine Name
    require!(!brand_name.is_empty(), ErrorCode::EmptyBrandName);
    require!(!generic_name.is_empty(), ErrorCode::EmptyGenericName);
    require!(brand_name.len() <= 100, ErrorCode::BrandNameTooLong);
    require!(generic_name.len() <= 100, ErrorCode::GenericNameTooLong);
    
    // Validation: 2. Batch Number
    require!(!batch_id.is_empty(), ErrorCode::EmptyBatchId);
    require!(batch_id.len() <= 50, ErrorCode::BatchIdTooLong);
    
    // Validation: 3 & 4. Date validation
    require!(expiry_date > manufacturing_date, ErrorCode::InvalidDateRange);
    
    let clock = Clock::get()?;
    // Check if medicine is expired
    require!(expiry_date > clock.unix_timestamp, ErrorCode::ExpiredMedicine);
    
    // Check for near-expiry (within 30 days) - warning but allow
    let days_until_expiry = (expiry_date - clock.unix_timestamp) / 86400;
    if days_until_expiry <= 30 {
        // Log warning but don't block registration
        msg!("Warning: Medicine expires in {} days", days_until_expiry);
    }
    
    // Validation: 5. MRP
    require!(mrp > 0, ErrorCode::InvalidMrp);
    
    // Validation: 6. Quantity
    require!(quantity_received > 0, ErrorCode::InvalidQuantity);
    
    // Validation: 8. Strength & Composition
    require!(!strength.is_empty(), ErrorCode::EmptyStrength);
    require!(!composition.is_empty(), ErrorCode::EmptyComposition);
    require!(strength.len() <= 50, ErrorCode::BatchIdTooLong);
    require!(composition.len() <= 100, ErrorCode::GenericNameTooLong);
    
    // Validation: 9. Manufacturer Details
    require!(!manufacturer_name.is_empty(), ErrorCode::EmptyManufacturerName);
    require!(!manufacturer_license.is_empty(), ErrorCode::EmptyManufacturerLicense);
    require!(!manufacturer_address.is_empty(), ErrorCode::EmptyManufacturerAddress);
    require!(manufacturer_name.len() <= 100, ErrorCode::BrandNameTooLong);
    require!(manufacturer_license.len() <= 50, ErrorCode::BatchIdTooLong);
    require!(manufacturer_address.len() <= 200, ErrorCode::BrandNameTooLong);
    
    // Validation: 11. Physical Condition
    require!(physical_condition == PhysicalCondition::Good, ErrorCode::InvalidPhysicalCondition);
    
    // Validation: 12. Invoice & GST
    require!(!invoice_number.is_empty(), ErrorCode::EmptyInvoiceNumber);
    require!(!gst_number.is_empty(), ErrorCode::EmptyGstNumber);
    require!(invoice_number.len() <= 50, ErrorCode::BatchIdTooLong);
    require!(gst_number.len() <= 20, ErrorCode::BatchIdTooLong);
    require!(invoice_date <= clock.unix_timestamp, ErrorCode::InvalidDateRange);

    let batch = &mut ctx.accounts.batch;

    // 1. Medicine Name
    batch.brand_name = brand_name;
    batch.generic_name = generic_name;
    
    // 2. Batch Number
    batch.batch_id = batch_id;
    
    // 3. Manufacturing Date
    batch.manufacturing_date = manufacturing_date;
    
    // 4. Expiry Date
    batch.expiry_date = expiry_date;
    
    // 5. MRP
    batch.mrp = mrp;
    
    // 6. Quantity Received
    batch.quantity_received = quantity_received;
    
    // 7. Dosage Form
    batch.dosage_form = dosage_form;
    
    // 8. Strength & Composition
    batch.strength = strength;
    batch.composition = composition;
    
    // 9. Manufacturer Details
    batch.manufacturer = ctx.accounts.manufacturer.key();
    batch.manufacturer_name = manufacturer_name;
    batch.manufacturer_license = manufacturer_license;
    batch.manufacturer_address = manufacturer_address;
    
    // 10. Storage Conditions
    batch.storage_condition = storage_condition;
    
    // 11. Physical Condition
    batch.physical_condition = physical_condition;
    
    // 12. Invoice & GST Details
    batch.invoice_number = invoice_number;
    batch.invoice_date = invoice_date;
    batch.gst_number = gst_number;
    
    // Status and metadata
    batch.status = BatchStatus::Active;
    batch.created_at = clock.unix_timestamp;
    batch.updated_at = clock.unix_timestamp;
    batch.bump = ctx.bumps.batch;

    emit!(BatchRegistered {
        batch_id: batch.batch_id.clone(),
        brand_name: batch.brand_name.clone(),
        generic_name: batch.generic_name.clone(),
        manufacturer: batch.manufacturer,
        batch_pda: batch.key(),
        manufacturing_date,
        expiry_date,
        mrp: batch.mrp,
        quantity_received: batch.quantity_received,
        dosage_form: batch.dosage_form,
        strength: batch.strength.clone(),
        composition: batch.composition.clone(),
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

