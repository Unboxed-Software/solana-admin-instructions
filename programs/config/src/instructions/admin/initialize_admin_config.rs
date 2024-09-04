use crate::program::Config;
use crate::state::AdminConfig;
use crate::ADMIN_PUBKEY;
use crate::SEED_ADMIN_CONFIG;
use crate::USDC_MINT_PUBKEY;
use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

#[derive(Accounts)]
pub struct InitializeAdminConfig<'info> {
    #[account(init, seeds = [SEED_ADMIN_CONFIG], bump, payer = authority, space = AdminConfig::LEN)]
    pub admin_config: Account<'info, AdminConfig>,
    #[account( token::mint = USDC_MINT_PUBKEY)]
    pub fee_destination: Account<'info, TokenAccount>,
    #[account(mut,address = ADMIN_PUBKEY)]
    pub authority: Signer<'info>,
    #[account(constraint = program.programdata_address()? == Some(program_data.key()))]
    pub program: Program<'info, Config>,
    #[account(constraint = program_data.upgrade_authority_address == Some(authority.key()))]
    pub program_data: Account<'info, ProgramData>,
    pub system_program: Program<'info, System>,
}

pub fn initialize_admin_config_handler(ctx: Context<InitializeAdminConfig>) -> Result<()> {
    ctx.accounts.admin_config.admin = ctx.accounts.authority.key();
    ctx.accounts.admin_config.fee_destination = ctx.accounts.fee_destination.key();
    ctx.accounts.admin_config.fee_basis_points = 100;
    Ok(())
}
