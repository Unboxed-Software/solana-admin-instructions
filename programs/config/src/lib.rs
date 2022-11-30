use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

declare_id!("29KLUpcQ1EHYqN3wqBkmo7o2T7xfhESpTKy6eEp9krNU");

#[cfg(feature = "test-mint")]
pub mod constants {
    use solana_program::{pubkey, pubkey::Pubkey};
    pub const USDC_MINT_PUBKEY: Pubkey = pubkey!("WaoKNLQVDyBx388CfjaVeyNbs3MT2mPgAhoCfXyUvg8");
}

#[cfg(not(feature = "test-mint"))]
pub mod constants {
    use solana_program::{pubkey, pubkey::Pubkey};
    // pub const USDC_MINT_PUBKEY: Pubkey = pubkey!("WaoKNLQVDyBx388CfjaVeyNbs3MT2mPgAhoCfXyUvg8");
    pub const USDC_MINT_PUBKEY: Pubkey = pubkey!("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
}

#[program]
pub mod config {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!(
            "Created Token Account for Mint: {}",
            constants::USDC_MINT_PUBKEY
        );

        if cfg!(feature = "test-message") {
            msg!("WAO! Test Message");
        } else {
            msg!("WAGMI! Not Test Message");
        }
        Ok(())
    }

    pub fn set_admin_settings(
        ctx: Context<SetAdminSettingsUseProgramState>,
        admin_data: u64,
    ) -> Result<()> {
        ctx.accounts.settings.admin_data = admin_data;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = payer,
        token::mint = mint,
        token::authority = payer,
    )]
    pub token: Account<'info, TokenAccount>,
    #[account(address = constants::USDC_MINT_PUBKEY)]
    // #[account(address = constants::MINT_PUBKEY.parse::<Pubkey>().unwrap())]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct SetAdminSettingsUseProgramState<'info> {
    #[account(init, seeds = [b"admin"], bump, payer = authority, space = Settings::LEN + 8)]
    pub settings: Account<'info, Settings>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(constraint = program.programdata_address()? == Some(program_data.key()))]
    pub program: Program<'info, crate::program::Config>,
    #[account(constraint = program_data.upgrade_authority_address == Some(authority.key()))]
    pub program_data: Account<'info, ProgramData>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Settings {
    admin_data: u64,
}

impl Settings {
    pub const LEN: usize = 8;
}
