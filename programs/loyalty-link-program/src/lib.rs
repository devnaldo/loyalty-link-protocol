use anchor_lang::prelude::*;
use anchor_spl::token::{mint_to, MintTo, Mint, Token, TokenAccount};

// IMPORTANT: You must replace this placeholder with the correct Program ID
// from your Anchor.toml file.
declare_id!("8V6oDMwNGK694Gw9VpDaLtVpjpeqDoWG5Bci1vhygPCw");

#[program]
pub mod loyalty_link_program {
    use super::*;

    pub fn create_loyalty_mint(_ctx: Context<CreateLoyaltyMint>) -> Result<()> {
        msg!("New Loyalty Token Mint Created Successfully!");
        msg!("Mint Address: {}", _ctx.accounts.mint.key());
        Ok(())
    }

    pub fn mint_loyalty_points(ctx: Context<MintLoyaltyPoints>, quantity: u64) -> Result<()> {
        msg!("Minting {} points to customer's account...", quantity);

        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.customer_token_account.to_account_info(),
            authority: ctx.accounts.merchant.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_context = CpiContext::new(cpi_program, cpi_accounts);

        mint_to(cpi_context, quantity)?;

        msg!("Successfully minted points!");
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

#[derive(Accounts)]
pub struct MintLoyaltyPoints<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,

    pub merchant: Signer<'info>,

    #[account(
        mut,
        constraint = customer_token_account.mint == mint.key()
    )]
    pub customer_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}
