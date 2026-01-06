use anchor_lang::prelude::*;
use crate::state::BatchStatus;
use crate::events::BatchExpired;
use crate::CheckAndUpdateExpiry;

pub fn handler(ctx: Context<CheckAndUpdateExpiry>, _batch_id: String) -> Result<()> {
    let clock = Clock::get()?;
    let batch = &mut ctx.accounts.batch;
    
    if batch.status == BatchStatus::Active && batch.is_expired(clock.unix_timestamp) {
        batch.status = BatchStatus::Expired;
        batch.updated_at = clock.unix_timestamp;
        
        emit!(BatchExpired {
            batch_id: batch.batch_id.clone(),
            batch_pda: batch.key(),
            expired_at: clock.unix_timestamp,
        });
        
        msg!(
            "Batch automatically expired: ID={}, Expiry Date={}",
            batch.batch_id,
            batch.expiry_date
        );
    }
    
    Ok(())
}

