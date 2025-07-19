use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod loyalty_link_program {
    use super::*;

    pub fn create_loyalty_mint(_ctx: Context<CreateLoyaltyMint>) -> Result<()> {
        msg!("New Loyalty Token Mint Created Successfully!");
        msg!("Mint Address: {}", _ctx.accounts.mint.key());
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateLoyaltyMint<'info> {
    #[account(
        init,
        payer = merchant,
        mint::decimals = 0,
        mint::authority = merchant
    )]
    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub merchant: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
