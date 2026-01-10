use anchor_lang::prelude::*;
use crate::state::BatchStatus;
use crate::error::ErrorCode;
use crate::events::BatchRegistered;
use crate::RegisterBatch;

pub fn handler(
    ctx: Context<RegisterBatch>,
    batch_id: String,
    manufacturing_date: i64,
    expiry_date: i64,
    metadata_hash: Option<String>,
) -> Result<()> {
    // Validation: Batch ID
    require!(!batch_id.is_empty(), ErrorCode::EmptyBatchId);
    require!(batch_id.len() <= 50, ErrorCode::BatchIdTooLong);
    
    // Validation: Date validation
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
    
    // Validation: Metadata hash if provided
    if let Some(ref hash) = metadata_hash {
        require!(hash.len() <= 64, ErrorCode::BatchIdTooLong);
    }

    let batch = &mut ctx.accounts.batch;

    // Essential fields only
    batch.batch_id = batch_id.clone();
    batch.manufacturer = ctx.accounts.manufacturer.key();
    batch.manufacturing_date = manufacturing_date;
    batch.expiry_date = expiry_date;
    batch.status = BatchStatus::Active;
    batch.created_at = clock.unix_timestamp;
    batch.updated_at = clock.unix_timestamp;
    batch.bump = ctx.bumps.batch;
    batch.metadata_hash = metadata_hash;

    emit!(BatchRegistered {
        batch_id: batch.batch_id.clone(),
        batch_pda: batch.key(),
        manufacturer: batch.manufacturer,
        manufacturing_date,
        expiry_date,
        metadata_hash: batch.metadata_hash.clone(),
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

