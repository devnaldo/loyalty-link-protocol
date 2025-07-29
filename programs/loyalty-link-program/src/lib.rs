use anchor_lang::prelude::*;
use anchor_spl::token::{mint_to, MintTo, Mint, Token, TokenAccount};
use std::option::Option as StdOption;

declare_id!("8V6oDMwNGK694Gw9VpDaLtVpjpeqDoWG5Bci1vhygPCw");

#[program]
pub mod loyalty_link_program {
    use super::*;

    pub fn create_loyalty_mint(_ctx: Context<CreateLoyaltyMint>) -> Result<()> {
        msg!("New Loyalty Token Mint Created Successfully!");
        msg!("Mint Address: {}", _ctx.accounts.mint.key());
        msg!("Mint Authority: {}", _ctx.accounts.merchant.key());
        Ok(())
    }

    pub fn mint_loyalty_points(ctx: Context<MintLoyaltyPoints>, quantity: u64) -> Result<()> {
        // Add quantity validation
        require!(quantity > 0, LoyaltyError::InvalidQuantity);
        require!(quantity <= 1_000_000, LoyaltyError::QuantityTooLarge);
        
        msg!("Minting {} points to customer's account...", quantity);
        msg!("Authorized by merchant: {}", ctx.accounts.merchant.key());

        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.customer_token_account.to_account_info(),
            authority: ctx.accounts.merchant.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_context = CpiContext::new(cpi_program, cpi_accounts);

        mint_to(cpi_context, quantity)?;

        msg!("Successfully minted {} points!", quantity);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateLoyaltyMint<'info> {
    #[account(
        init,
        payer = merchant,
        mint::decimals = 0,
        mint::authority = merchant,
        mint::freeze_authority = merchant,
    )]
    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub merchant: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintLoyaltyPoints<'info> {
    #[account(
        mut,
        constraint = mint.mint_authority.is_some() @ LoyaltyError::NoMintAuthority,
        constraint = mint.mint_authority.unwrap() == merchant.key() @ LoyaltyError::UnauthorizedMint
    )]
    pub mint: Account<'info, Mint>,

    // CRITICAL FIX: Only the mint authority (merchant) can mint tokens
    pub merchant: Signer<'info>,

    #[account(
        mut,
        constraint = customer_token_account.mint == mint.key() @ LoyaltyError::InvalidMint
    )]
    pub customer_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

// Custom error codes for better security and debugging
#[error_code]
pub enum LoyaltyError {
    #[msg("Mint has no authority set")]
    NoMintAuthority,
    #[msg("Only the mint authority can mint tokens")]
    UnauthorizedMint,
    #[msg("Invalid mint account")]
    InvalidMint,
    #[msg("Quantity must be greater than 0")]
    InvalidQuantity,
    #[msg("Quantity too large - maximum 1,000,000 per transaction")]
    QuantityTooLarge,
}