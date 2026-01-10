use anchor_lang::prelude::*;
use crate::state::BatchStatus;

#[event]
pub struct BatchRegistered {
    pub batch_id: String,
    pub batch_pda: Pubkey,
    pub manufacturer: Pubkey,
    pub manufacturing_date: i64,
    pub expiry_date: i64,
    pub metadata_hash: Option<String>,
    pub timestamp: i64,
}

#[event]
pub struct BatchStatusUpdated {
    pub batch_id: String,
    pub batch_pda: Pubkey,
    pub old_status: BatchStatus,
    pub new_status: BatchStatus,
    pub updated_by: Pubkey,
    pub timestamp: i64,
}


