use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Batch ID cannot be empty")]
    EmptyBatchId,

    #[msg("Batch ID exceeds maximum length (64 chars)")]
    BatchIdTooLong,

    #[msg("Metadata hash exceeds maximum length (64 chars)")]
    MetadataHashTooLong,

    #[msg("Expiry date must be after manufacturing date")]
    InvalidDateRange,

    #[msg("Expired medicine cannot be registered")]
    ExpiredMedicine,

    #[msg("Quantity must be greater than zero")]
    InvalidQuantity,

    #[msg("MRP must be greater than zero")]
    InvalidMrp,

    #[msg("Only the manufacturer can perform this action")]
    UnauthorizedManufacturer,

    #[msg("Invalid batch status transition")]
    InvalidBatchStatus,

    #[msg("Manufacturer is not verified in the registry")]
    ManufacturerNotVerified,

    #[msg("Cannot modify a recalled batch")]
    BatchAlreadyRecalled,
}
