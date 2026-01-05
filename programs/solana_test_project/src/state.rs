use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum BatchStatus {
    Active,
    Recalled,
    Expired,
}

#[account]
pub struct Batch {
    pub batch_id: String,
    pub medicine_name: String,
    pub manufacturer: Pubkey,
    pub manufacturing_date: i64,
    pub expiry_date: i64,
    pub status: BatchStatus,
    pub created_at: i64,
    pub updated_at: i64,
    pub bump: u8,
}

impl Batch {
    pub const MAX_SIZE: usize = 54 + 104 + 32 + 8 + 8 + 1 + 8 + 8 + 1;
    
    pub fn is_expired(&self, current_timestamp: i64) -> bool {
        current_timestamp > self.expiry_date
    }
    
    pub fn is_valid(&self, current_timestamp: i64) -> bool {
        self.status != BatchStatus::Recalled && !self.is_expired(current_timestamp)
    }
}
