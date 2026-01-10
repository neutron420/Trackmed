use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum BatchStatus {
    Active,
    Recalled,
    Expired,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum DosageForm {
    Tablet,
    Capsule,
    Syrup,
    Injection,
    Ointment,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum StorageCondition {
    Normal,
    CoolPlace,
    Refrigerated, // 2-8°C
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum PhysicalCondition {
    Good,
    BrokenStrips,
    LeakingBottles,
    FadedLabels,
    TornPackaging,
}

// Minimal on-chain Batch struct - only essential data for verification
// Detailed metadata (manufacturer details, invoice info, etc.) should be stored off-chain (IPFS/Arweave)
#[account]
pub struct Batch {
    // Essential identifiers
    pub batch_id: String, // Max 50 chars
    pub manufacturer: Pubkey, // Verified manufacturer
    
    // Essential dates for expiry checking
    pub manufacturing_date: i64,
    pub expiry_date: i64,
    
    // Essential status tracking
    pub status: BatchStatus,
    
    // Metadata timestamps
    pub created_at: i64,
    pub updated_at: i64,
    
    // PDA bump
    pub bump: u8,
    
    // Optional: Hash of off-chain metadata (IPFS CID or similar)
    // This allows linking to detailed data stored off-chain
    pub metadata_hash: Option<String>, // Max 64 chars for IPFS CID
}

// Manufacturer Registry - stores verified manufacturer information
#[account]
pub struct ManufacturerRegistry {
    pub manufacturer: Pubkey,
    pub is_verified: bool,
    pub registered_at: i64,
    pub bump: u8,
}

impl ManufacturerRegistry {
    pub const MAX_SIZE: usize = 8 + // discriminator
        32 +  // manufacturer (Pubkey)
        1 +   // is_verified (bool)
        8 +   // registered_at (i64)
        1;    // bump (u8)
}

impl Batch {
    // Minimal size calculation
    // batch_id: 4 + 50 = 54
    // manufacturer: 32 (Pubkey)
    // manufacturing_date: 8 (i64)
    // expiry_date: 8 (i64)
    // status: 1 (enum)
    // created_at: 8 (i64)
    // updated_at: 8 (i64)
    // bump: 1 (u8)
    // metadata_hash: 1 (Option discriminator) + 4 + 64 = 69
    pub const MAX_SIZE: usize = 8 + // discriminator
        54 +  // batch_id (4 + 50)
        32 +  // manufacturer (Pubkey)
        8 +   // manufacturing_date (i64)
        8 +   // expiry_date (i64)
        1 +   // status (enum)
        8 +   // created_at (i64)
        8 +   // updated_at (i64)
        1 +   // bump (u8)
        69;   // metadata_hash (Option<String>: 1 + 4 + 64)
    
    pub fn is_expired(&self, current_timestamp: i64) -> bool {
        current_timestamp > self.expiry_date
    }
    
    pub fn is_valid(&self, current_timestamp: i64) -> bool {
        self.status != BatchStatus::Recalled && 
        !self.is_expired(current_timestamp)
    }
}
