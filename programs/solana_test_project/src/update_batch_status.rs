use anchor_lang::prelude::*;
use crate::state::BatchStatus;
use crate::events::BatchStatusUpdated;

pub fn handler(
    ctx: Context<crate::UpdateBatchStatus>,
    _batch_hash: String,
    new_status: BatchStatus,
) -> Result<()> {
    let clock = Clock::get()?;
    let batch = &mut ctx.accounts.batch;
    
    // Only allow Valid or Recalled status
    require!(
        new_status == BatchStatus::Valid || new_status == BatchStatus::Recalled,
        crate::error::ErrorCode::InvalidBatchStatus
    );
    
    let old_status = batch.status;
    
    batch.status = new_status;
    
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

