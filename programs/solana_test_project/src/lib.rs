use anchor_lang::prelude::*;

pub mod state;
pub mod error;
pub mod events;

// Instruction handler modules (handlers only, Account structs are in lib.rs)
pub mod register_manufacturer;
pub mod register_batch;
pub mod update_batch_status;

declare_id!("48BYj4BVCp7D3EByu6f9nW8uHaFuuFdwJozB7iLZPxhJ");

// Account structs defined directly in lib.rs to work around Anchor 0.32.1 macro bug
#[derive(Accounts)]
pub struct RegisterManufacturer<'info> {
    #[account(
        init,
        payer = manufacturer,
        space = state::ManufacturerRegistry::MAX_SIZE,
        seeds = [b"manufacturer", manufacturer.key().as_ref()],
        bump
    )]
    pub registry: Account<'info, state::ManufacturerRegistry>,

    #[account(mut)]
    pub manufacturer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

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

    #[account(
        seeds = [b"manufacturer", manufacturer.key().as_ref()],
        bump = registry.bump,
        constraint = registry.is_verified @ error::ErrorCode::ManufacturerNotVerified
    )]
    pub registry: Account<'info, state::ManufacturerRegistry>,

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


#[program]
pub mod solana_test_project {
    use super::*;

    pub fn register_manufacturer(ctx: Context<RegisterManufacturer>) -> Result<()> {
        register_manufacturer::handler(ctx)
    }

    pub fn register_batch(
        ctx: Context<RegisterBatch>,
        batch_id: String,
        manufacturing_date: i64,
        expiry_date: i64,
        metadata_hash: Option<String>,
    ) -> Result<()> {
        register_batch::handler(
            ctx,
            batch_id,
            manufacturing_date,
            expiry_date,
            metadata_hash,
        )
    }

    pub fn update_batch_status(
        ctx: Context<UpdateBatchStatus>,
        batch_id: String,
        new_status: state::BatchStatus,
    ) -> Result<()> {
        update_batch_status::handler(ctx, batch_id, new_status)
    }
}
