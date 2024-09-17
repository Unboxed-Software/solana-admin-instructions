use crate::program::Config;
use crate::state::ProgramConfig;
use crate::{SEED_PROGRAM_CONFIG, USDC_MINT_PUBKEY};
use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

pub const DISCRIMINATOR_SIZE: usize = 8;

#[derive(Accounts)]
pub struct InitializeProgramConfig<'info> {
    #[account(
        init,
        seeds = [SEED_PROGRAM_CONFIG],
        bump,
        payer = authority,
        space = DISCRIMINATOR_SIZE + ProgramConfig::INIT_SPACE
    )]          
    pub program_config: Account<'info, ProgramConfig>,
    #[account(token::mint = USDC_MINT_PUBKEY)]
    pub fee_destination: Account<'info, TokenAccount>,
    #[account(constraint = program.programdata_address()? == Some(program_data.key()))]
    pub program: Program<'info, Config>,
    #[account(constraint = program_data.upgrade_authority_address == Some(authority.key()))]
    pub program_data: Account<'info, ProgramData>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn initialize_program_config_handler(ctx: Context<InitializeProgramConfig>) -> Result<()> {
    ctx.accounts.program_config.set_inner(ProgramConfig {
        admin: ctx.accounts.authority.key(),
        fee_destination: ctx.accounts.fee_destination.key(),
        fee_basis_points: 100,
    });
    Ok(())
}