use anchor_lang::prelude::*;
use crate::state::BatchStatus;
use crate::error::ErrorCode;
use crate::events::BatchRegistered;
use crate::RegisterBatch;

pub fn handler(
    ctx: Context<RegisterBatch>,
    batch_hash: String,
    manufacturing_date: i64,
    expiry_date: i64,
) -> Result<()> {
    // Validation: Batch hash
    require!(!batch_hash.is_empty(), ErrorCode::EmptyBatchId);
    require!(batch_hash.len() <= 64, ErrorCode::BatchIdTooLong);
    
    // Validation: Date validation
    require!(expiry_date > manufacturing_date, ErrorCode::InvalidDateRange);
    
    let clock = Clock::get()?;
    // Check if medicine is expired
    require!(expiry_date > clock.unix_timestamp, ErrorCode::ExpiredMedicine);

    let batch = &mut ctx.accounts.batch;

    // Essential fields only - blockchain stores ONLY immutable proof
    batch.batch_hash = batch_hash.clone();
    batch.manufacturer_wallet = ctx.accounts.manufacturer.key();
    batch.manufacturing_date = manufacturing_date;
    batch.expiry_date = expiry_date;
    batch.status = BatchStatus::Valid;
    batch.created_at = clock.unix_timestamp;
    batch.bump = ctx.bumps.batch;

    emit!(BatchRegistered {
        batch_hash: batch.batch_hash.clone(),
        batch_pda: batch.key(),
        manufacturer_wallet: batch.manufacturer_wallet,
        manufacturing_date,
        expiry_date,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

