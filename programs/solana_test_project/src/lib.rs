use anchor_lang::prelude::*;

declare_id!("BaFvHTidU6MSbAyGmiRe3YzY7JN2hmVEZqeap2sy3hDP");

#[program]
pub mod solana_test_project {
    use super::*;

    pub fn hello(_ctx: Context<Hello>) -> Result<()> {
        msg!("Hello Solana! Project is working.");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Hello {}
