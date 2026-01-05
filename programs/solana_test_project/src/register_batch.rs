use anchor_lang::prelude::*;
use crate::state::BatchStatus;
use crate::error::ErrorCode;
use crate::events::BatchRegistered;
use crate::RegisterBatch;

pub fn handler(
    ctx: Context<RegisterBatch>,
    batch_id: String,
    medicine_name: String,
    manufacturing_date: i64,
    expiry_date: i64,
) -> Result<()> {
    require!(!batch_id.is_empty(), ErrorCode::EmptyBatchId);

    let clock = Clock::get()?;
    let batch = &mut ctx.accounts.batch;

    batch.batch_id = batch_id;
    batch.medicine_name = medicine_name;
    batch.manufacturer = ctx.accounts.manufacturer.key();
    batch.manufacturing_date = manufacturing_date;
    batch.expiry_date = expiry_date;
    batch.status = BatchStatus::Active;
    batch.created_at = clock.unix_timestamp;
    batch.updated_at = clock.unix_timestamp;
    batch.bump = ctx.bumps.batch;

    emit!(BatchRegistered {
        batch_id: batch.batch_id.clone(),
        medicine_name: batch.medicine_name.clone(),
        manufacturer: batch.manufacturer,
        batch_pda: batch.key(),
        manufacturing_date,
        expiry_date,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

