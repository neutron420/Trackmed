use anchor_lang::prelude::*;
use crate::state::BatchStatus;

#[event]
pub struct BatchRegistered {
    pub batch_id: String,
    pub medicine_name: String,
    pub manufacturer: Pubkey,
    pub batch_pda: Pubkey,
    pub manufacturing_date: i64,
    pub expiry_date: i64,
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

#[event]
pub struct BatchVerified {
    pub batch_id: String,
    pub batch_pda: Pubkey,
    pub medicine_name: String,
    pub manufacturer: Pubkey,
    pub status: BatchStatus,
    pub is_expired: bool,
    pub is_valid: bool,
    pub verified_at: i64,
}

#[event]
pub struct BatchExpired {
    pub batch_id: String,
    pub batch_pda: Pubkey,
    pub expired_at: i64,
}

