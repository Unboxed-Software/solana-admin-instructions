use crate::state::ProgramConfig;
use crate::{SEED_PROGRAM_CONFIG, USDC_MINT_PUBKEY};
use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

#[derive(Accounts)]
pub struct UpdateProgramConfig<'info> {
    #[account(mut, seeds = [SEED_PROGRAM_CONFIG], bump)]
    pub program_config: Account<'info, ProgramConfig>,
    #[account(token::mint = USDC_MINT_PUBKEY)]
    pub fee_destination: Account<'info, TokenAccount>,
    #[account(mut, address = program_config.admin)]
    pub admin: Signer<'info>,
    /// CHECK: arbitrarily assigned by existing admin
    pub new_admin: UncheckedAccount<'info>,
}

pub fn update_program_config_handler(
    ctx: Context<UpdateProgramConfig>,
    new_fee: u64,
) -> Result<()> {
    ctx.accounts.program_config.set_inner(ProgramConfig {
        admin: ctx.accounts.new_admin.key(),
        fee_destination: ctx.accounts.fee_destination.key(),
        fee_basis_points: new_fee,
    });
    Ok(())
}
