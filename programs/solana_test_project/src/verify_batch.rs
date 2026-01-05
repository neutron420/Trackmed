use anchor_lang::prelude::*;
use crate::events::BatchVerified;
use crate::VerifyBatch;

pub fn handler(ctx: Context<VerifyBatch>, _batch_id: String) -> Result<()> {
    let batch = &ctx.accounts.batch;
    let clock = Clock::get()?;
    
    let is_expired = batch.is_expired(clock.unix_timestamp);
    let is_valid = batch.is_valid(clock.unix_timestamp);
    
    emit!(BatchVerified {
        batch_id: batch.batch_id.clone(),
        batch_pda: batch.key(),
        medicine_name: batch.medicine_name.clone(),
        manufacturer: batch.manufacturer,
        status: batch.status,
        is_expired,
        is_valid,
        verified_at: clock.unix_timestamp,
    });
    
    msg!(
        "Batch verification: ID={}, Medicine={}, Status={:?}, Expired={}, Valid={}",
        batch.batch_id,
        batch.medicine_name,
        batch.status,
        is_expired,
        is_valid
    );
    
    Ok(())
}

