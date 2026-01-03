use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod solana_test_project {
    use super::*;

    pub fn hello(_ctx: Context<Hello>) -> Result<()> {
        msg!("Hello Solana Test Project!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Hello {}
