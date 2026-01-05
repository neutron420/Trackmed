use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Batch ID cannot be empty")]
    EmptyBatchId,
    
    #[msg("Medicine name cannot be empty")]
    EmptyMedicineName,
    
    #[msg("Expiry date must be after manufacturing date")]
    InvalidDateRange,
    
    #[msg("Only the manufacturer can perform this action")]
    UnauthorizedManufacturer,
    
    #[msg("Batch not found")]
    BatchNotFound,
    
    #[msg("Batch ID exceeds maximum length")]
    BatchIdTooLong,
    
    #[msg("Medicine name exceeds maximum length")]
    MedicineNameTooLong,
    
    #[msg("Invalid batch status")]
    InvalidBatchStatus,
}
