use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Batch ID cannot be empty")]
    EmptyBatchId,
    
    #[msg("Brand name cannot be empty")]
    EmptyBrandName,
    
    #[msg("Generic name cannot be empty")]
    EmptyGenericName,
    
    #[msg("Expiry date must be after manufacturing date")]
    InvalidDateRange,
    
    #[msg("Expired medicine cannot be registered")]
    ExpiredMedicine,
    
    #[msg("Near-expiry medicine detected")]
    NearExpiryMedicine,
    
    #[msg("Only the manufacturer can perform this action")]
    UnauthorizedManufacturer,
    
    #[msg("Batch not found")]
    BatchNotFound,
    
    #[msg("Batch ID exceeds maximum length")]
    BatchIdTooLong,
    
    #[msg("Brand name exceeds maximum length")]
    BrandNameTooLong,
    
    #[msg("Generic name exceeds maximum length")]
    GenericNameTooLong,
    
    #[msg("Invalid batch status")]
    InvalidBatchStatus,
    
    #[msg("MRP cannot be zero")]
    InvalidMrp,
    
    #[msg("Quantity received cannot be zero")]
    InvalidQuantity,
    
    #[msg("Strength cannot be empty")]
    EmptyStrength,
    
    #[msg("Composition cannot be empty")]
    EmptyComposition,
    
    #[msg("Manufacturer name cannot be empty")]
    EmptyManufacturerName,
    
    #[msg("Manufacturer license cannot be empty")]
    EmptyManufacturerLicense,
    
    #[msg("Manufacturer address cannot be empty")]
    EmptyManufacturerAddress,
    
    #[msg("Invoice number cannot be empty")]
    EmptyInvoiceNumber,
    
    #[msg("GST number cannot be empty")]
    EmptyGstNumber,
    
    #[msg("Invalid physical condition - medicine must be in good condition")]
    InvalidPhysicalCondition,
    
    #[msg("Manufacturer is not verified in the registry")]
    ManufacturerNotVerified,
    
    #[msg("Manufacturer is already registered")]
    ManufacturerAlreadyRegistered,
}
