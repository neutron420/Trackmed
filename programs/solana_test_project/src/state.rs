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

#[account]
pub struct Batch {
    // 1. Medicine Name (Brand + Generic)
    pub brand_name: String,
    pub generic_name: String,
    
    // 2. Batch Number
    pub batch_id: String,
    
    // 3. Manufacturing Date (MFG)
    pub manufacturing_date: i64,
    
    // 4. Expiry Date (EXP)
    pub expiry_date: i64,
    
    // 5. MRP (Maximum Retail Price)
    pub mrp: u64, // in smallest currency unit (paise/cents)
    
    // 6. Quantity Received
    pub quantity_received: u32,
    
    // 7. Dosage Form
    pub dosage_form: DosageForm,
    
    // 8. Strength & Composition
    pub strength: String, // e.g., "500 mg", "650 mg"
    pub composition: String, // e.g., "Paracetamol 500mg"
    
    // 9. Manufacturer Details
    pub manufacturer: Pubkey,
    pub manufacturer_name: String,
    pub manufacturer_license: String,
    pub manufacturer_address: String,
    
    // 10. Storage Conditions
    pub storage_condition: StorageCondition,
    
    // 11. Physical Condition
    pub physical_condition: PhysicalCondition,
    
    // 12. Invoice & GST Details
    pub invoice_number: String,
    pub invoice_date: i64,
    pub gst_number: String,
    
    // Status and metadata
    pub status: BatchStatus,
    pub created_at: i64,
    pub updated_at: i64,
    pub bump: u8,
}

impl Batch {
    // Calculate MAX_SIZE: 8 (discriminator) + all fields
    // String fields: 4 (length) + string bytes (max lengths)
    // brand_name: 4 + 100 = 104
    // generic_name: 4 + 100 = 104
    // batch_id: 4 + 50 = 54
    // mrp: 8 (u64)
    // quantity_received: 4 (u32)
    // dosage_form: 1 (enum)
    // strength: 4 + 50 = 54
    // composition: 4 + 100 = 104
    // manufacturer: 32 (Pubkey)
    // manufacturer_name: 4 + 100 = 104
    // manufacturer_license: 4 + 50 = 54
    // manufacturer_address: 4 + 200 = 204
    // storage_condition: 1 (enum)
    // physical_condition: 1 (enum)
    // invoice_number: 4 + 50 = 54
    // invoice_date: 8 (i64)
    // gst_number: 4 + 20 = 24
    // status: 1 (enum)
    // created_at: 8 (i64)
    // updated_at: 8 (i64)
    // bump: 1 (u8)
    pub const MAX_SIZE: usize = 8 + // discriminator
        104 + // brand_name
        104 + // generic_name
        54 +  // batch_id
        8 +   // manufacturing_date
        8 +   // expiry_date
        8 +   // mrp
        4 +   // quantity_received
        1 +   // dosage_form
        54 +  // strength
        104 + // composition
        32 +  // manufacturer
        104 + // manufacturer_name
        54 +  // manufacturer_license
        204 + // manufacturer_address
        1 +   // storage_condition
        1 +   // physical_condition
        54 +  // invoice_number
        8 +   // invoice_date
        24 +  // gst_number
        1 +   // status
        8 +   // created_at
        8 +   // updated_at
        1;    // bump
    
    pub fn is_expired(&self, current_timestamp: i64) -> bool {
        current_timestamp > self.expiry_date
    }
    
    pub fn is_valid(&self, current_timestamp: i64) -> bool {
        self.status != BatchStatus::Recalled && 
        !self.is_expired(current_timestamp) &&
        self.physical_condition == PhysicalCondition::Good
    }
}
