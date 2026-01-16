use anchor_lang::prelude::*;
use crate::state::BatchStatus;
use crate::events::BatchStatusUpdated;
use crate::error::ErrorCode;

pub fn handler(
    ctx: Context<crate::UpdateBatchStatus>,
    _batch_hash: String,
    new_status: BatchStatus,
) -> Result<()> {
    let clock = Clock::get()?;
    let batch = &mut ctx.accounts.batch;
    
    let old_status = batch.status;
    
    // Cannot modify a recalled batch
    require!(old_status != BatchStatus::Recalled, ErrorCode::BatchAlreadyRecalled);
    
    // Valid status transitions:
    // Valid -> Suspended, Valid -> Recalled
    // Suspended -> Valid, Suspended -> Recalled
    // Recalled is terminal (handled above)
    
    batch.status = new_status;
    batch.updated_at = clock.unix_timestamp;
    
    emit!(BatchStatusUpdated {
        batch_hash: batch.batch_hash.clone(),
        batch_pda: batch.key(),
        old_status,
        new_status: batch.status,
        updated_by: ctx.accounts.manufacturer.key(),
        timestamp: clock.unix_timestamp,
    });
    
    msg!(
        "Batch status updated: Hash={}, Old Status={:?}, New Status={:?}",
        batch.batch_hash,
        old_status,
        batch.status
    );
    
    Ok(())
}

