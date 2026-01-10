use anchor_lang::prelude::*;

// Blockchain stores ONLY immutable proof data
// All business details are stored in PostgreSQL database
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum BatchStatus {
    Valid,
    Recalled,
}

// Minimal on-chain Batch struct - ONLY essential data for verification
// DO NOT store business details here - they belong in the database
#[account]
pub struct Batch {
    // Essential identifiers
    pub batch_hash: String, // Max 64 chars - hash identifier for the batch
    pub manufacturer_wallet: Pubkey, // Verified manufacturer wallet address
    
    // Essential dates for expiry checking
    pub manufacturing_date: i64,
    pub expiry_date: i64,
    
    // Essential status tracking (valid or recalled only)
    pub status: BatchStatus,
    
    // Creation timestamp
    pub created_at: i64,
    
    // PDA bump
    pub bump: u8,
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
    // Minimal size calculation - only essential verification data
    // batch_hash: 4 + 64 = 68
    // manufacturer_wallet: 32 (Pubkey)
    // manufacturing_date: 8 (i64)
    // expiry_date: 8 (i64)
    // status: 1 (enum)
    // created_at: 8 (i64)
    // bump: 1 (u8)
    pub const MAX_SIZE: usize = 8 + // discriminator
        68 +  // batch_hash (4 + 64)
        32 +  // manufacturer_wallet (Pubkey)
        8 +   // manufacturing_date (i64)
        8 +   // expiry_date (i64)
        1 +   // status (enum)
        8 +   // created_at (i64)
        1;    // bump (u8)
}
