use anchor_lang::prelude::*;
use crate::state::BatchStatus;

#[event]
pub struct BatchRegistered {
    pub batch_hash: String,
    pub batch_pda: Pubkey,
    pub manufacturer_wallet: Pubkey,
    pub metadata_hash: Option<String>,
    pub manufacturing_date: i64,
    pub expiry_date: i64,
    pub quantity: u64,
    pub mrp: u64,
    pub timestamp: i64,
}

#[event]
pub struct BatchStatusUpdated {
    pub batch_hash: String,
    pub batch_pda: Pubkey,
    pub old_status: BatchStatus,
    pub new_status: BatchStatus,
    pub updated_by: Pubkey,
    pub timestamp: i64,
}


