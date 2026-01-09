use anchor_lang::prelude::*;

pub mod state;
pub mod error;
pub mod events;

// Instruction handler modules (handlers only, Account structs are in lib.rs)
pub mod register_batch;
pub mod update_batch_status;
pub mod verify_batch;
pub mod verify_batch_by_pda;
pub mod check_and_update_expiry;

declare_id!("48BYj4BVCp7D3EByu6f9nW8uHaFuuFdwJozB7iLZPxhJ");

// Account structs defined directly in lib.rs to work around Anchor 0.32.1 macro bug
#[derive(Accounts)]
#[instruction(batch_id: String)]
pub struct RegisterBatch<'info> {
    #[account(
        init,
        payer = manufacturer,
        space = state::Batch::MAX_SIZE,
        seeds = [b"batch", manufacturer.key().as_ref(), batch_id.as_bytes()],
        bump
    )]
    pub batch: Account<'info, state::Batch>,

    #[account(mut)]
    pub manufacturer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(batch_id: String)]
pub struct UpdateBatchStatus<'info> {
    #[account(
        mut,
        seeds = [b"batch", manufacturer.key().as_ref(), batch_id.as_bytes()],
        bump = batch.bump,
        has_one = manufacturer @ error::ErrorCode::UnauthorizedManufacturer
    )]
    pub batch: Account<'info, state::Batch>,
    
    pub manufacturer: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(batch_id: String)]
pub struct VerifyBatch<'info> {
    #[account(
        seeds = [b"batch", manufacturer.key().as_ref(), batch_id.as_bytes()],
        bump = batch.bump
    )]
    pub batch: Account<'info, state::Batch>,
    
    /// CHECK: Manufacturer is verified via PDA seeds constraint
    #[account()]
    pub manufacturer: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct VerifyBatchByPda<'info> {
    /// CHECK: Batch account is provided by caller and verified externally
    pub batch: Account<'info, state::Batch>,
}

#[derive(Accounts)]
#[instruction(batch_id: String)]
pub struct CheckAndUpdateExpiry<'info> {
    #[account(
        mut,
        seeds = [b"batch", manufacturer.key().as_ref(), batch_id.as_bytes()],
        bump = batch.bump
    )]
    pub batch: Account<'info, state::Batch>,
    
    /// CHECK: Manufacturer is verified via PDA seeds constraint
    #[account()]
    pub manufacturer: UncheckedAccount<'info>,
}

#[program]
pub mod solana_test_project {
    use super::*;

    pub fn register_batch(
        ctx: Context<RegisterBatch>,
        brand_name: String,
        generic_name: String,
        batch_id: String,
        manufacturing_date: i64,
        expiry_date: i64,
        mrp: u64,
        quantity_received: u32,
        dosage_form: state::DosageForm,
        strength: String,
        composition: String,
        manufacturer_name: String,
        manufacturer_license: String,
        manufacturer_address: String,
        storage_condition: state::StorageCondition,
        physical_condition: state::PhysicalCondition,
        invoice_number: String,
        invoice_date: i64,
        gst_number: String,
    ) -> Result<()> {
        register_batch::handler(
            ctx,
            brand_name,
            generic_name,
            batch_id,
            manufacturing_date,
            expiry_date,
            mrp,
            quantity_received,
            dosage_form,
            strength,
            composition,
            manufacturer_name,
            manufacturer_license,
            manufacturer_address,
            storage_condition,
            physical_condition,
            invoice_number,
            invoice_date,
            gst_number,
        )
    }

    pub fn update_batch_status(
        ctx: Context<UpdateBatchStatus>,
        batch_id: String,
        new_status: state::BatchStatus,
    ) -> Result<()> {
        update_batch_status::handler(ctx, batch_id, new_status)
    }

    pub fn verify_batch(
        ctx: Context<VerifyBatch>,
        batch_id: String,
    ) -> Result<()> {
        verify_batch::handler(ctx, batch_id)
    }

    pub fn verify_batch_by_pda(
        ctx: Context<VerifyBatchByPda>,
    ) -> Result<()> {
        verify_batch_by_pda::handler(ctx)
    }

    pub fn check_and_update_expiry(
        ctx: Context<CheckAndUpdateExpiry>,
        batch_id: String,
    ) -> Result<()> {
        check_and_update_expiry::handler(ctx, batch_id)
    }
}
