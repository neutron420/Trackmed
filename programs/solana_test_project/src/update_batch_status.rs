use anchor_lang::prelude::*;
use crate::state::BatchStatus;
use crate::events::BatchStatusUpdated;

pub fn handler(
    ctx: Context<crate::UpdateBatchStatus>,
    _batch_id: String,
    new_status: BatchStatus,
) -> Result<()> {
    let clock = Clock::get()?;
    let batch = &mut ctx.accounts.batch;
    
    let old_status = batch.status;
    
    batch.status = new_status;
    batch.updated_at = clock.unix_timestamp;
    
    emit!(BatchStatusUpdated {
        batch_id: batch.batch_id.clone(),
        batch_pda: batch.key(),
        old_status,
        new_status: batch.status,
        updated_by: ctx.accounts.manufacturer.key(),
        timestamp: clock.unix_timestamp,
    });
    
    msg!(
        "Batch status updated: ID={}, Old Status={:?}, New Status={:?}",
        batch.batch_id,
        old_status,
        batch.status
    );
    
    Ok(())
}

