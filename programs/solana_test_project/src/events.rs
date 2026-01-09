use anchor_lang::prelude::*;
use crate::state::{BatchStatus, DosageForm};

#[event]
pub struct BatchRegistered {
    pub batch_id: String,
    pub brand_name: String,
    pub generic_name: String,
    pub manufacturer: Pubkey,
    pub batch_pda: Pubkey,
    pub manufacturing_date: i64,
    pub expiry_date: i64,
    pub mrp: u64,
    pub quantity_received: u32,
    pub dosage_form: DosageForm,
    pub strength: String,
    pub composition: String,
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
    pub brand_name: String,
    pub generic_name: String,
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

