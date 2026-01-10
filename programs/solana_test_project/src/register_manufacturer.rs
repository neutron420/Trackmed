use anchor_lang::prelude::*;

pub fn handler(ctx: Context<crate::RegisterManufacturer>) -> Result<()> {
    let clock = Clock::get()?;
    let registry = &mut ctx.accounts.registry;
    
    // Initialize registry (Anchor's init constraint ensures account doesn't exist)
    registry.manufacturer = ctx.accounts.manufacturer.key();
    registry.is_verified = true;
    registry.registered_at = clock.unix_timestamp;
    registry.bump = ctx.bumps.registry;
    
    msg!(
        "Manufacturer registered: {}",
        ctx.accounts.manufacturer.key()
    );
    
    Ok(())
}
