use anchor_lang::prelude::*;

// Blockchain stores immutable proof data + essential business fields
// Detailed business data can be stored in PostgreSQL database
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum BatchStatus {
    Valid,
    Suspended,
    Recalled,
}

// On-chain Batch struct - essential data for verification and tracking
#[account]
pub struct Batch {
    // Essential identifiers
    pub batch_hash: String,          // Max 64 chars - unique batch identifier
    pub manufacturer_wallet: Pubkey, // Verified manufacturer wallet address
    
    // Optional metadata hash (IPFS/Arweave) for off-chain details
    pub metadata_hash: Option<String>, // Max 64 chars - CID or hash pointing to detailed metadata
    
    // Essential dates for expiry checking
    pub manufacturing_date: i64,
    pub expiry_date: i64,
    
    // Business fields stored on-chain for transparency
    pub quantity: u64,               // Total quantity in batch
    pub mrp: u64,                    // Maximum Retail Price in smallest unit (paise/cents)
    
    // Status tracking (Valid, Suspended, or Recalled)
    pub status: BatchStatus,
    
    // Timestamps
    pub created_at: i64,
    pub updated_at: i64,
    
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
    // Size calculation for enriched batch data
    // batch_hash: 4 + 64 = 68 (String with max 64 chars)
    // manufacturer_wallet: 32 (Pubkey)
    // metadata_hash: 1 + 4 + 64 = 69 (Option<String> with max 64 chars)
    // manufacturing_date: 8 (i64)
    // expiry_date: 8 (i64)
    // quantity: 8 (u64)
    // mrp: 8 (u64)
    // status: 1 (enum)
    // created_at: 8 (i64)
    // updated_at: 8 (i64)
    // bump: 1 (u8)
    pub const MAX_SIZE: usize = 8 +   // discriminator
        68 +  // batch_hash (4 + 64)
        32 +  // manufacturer_wallet (Pubkey)
        69 +  // metadata_hash (1 + 4 + 64 for Option<String>)
        8 +   // manufacturing_date (i64)
        8 +   // expiry_date (i64)
        8 +   // quantity (u64)
        8 +   // mrp (u64)
        1 +   // status (enum)
        8 +   // created_at (i64)
        8 +   // updated_at (i64)
        1;    // bump (u8)
}
