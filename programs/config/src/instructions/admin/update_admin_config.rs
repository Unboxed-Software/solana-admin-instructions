use crate::state::AdminConfig;
use crate::ADMIN_PUBKEY;
use crate::SEED_ADMIN_CONFIG;
use crate::USDC_MINT_PUBKEY;
use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

#[derive(Accounts)]
pub struct UpdateAdminConfig<'info> {
    #[account(mut, seeds = [SEED_ADMIN_CONFIG], bump)]
    pub admin_config: Account<'info, AdminConfig>,
    #[account( token::mint = USDC_MINT_PUBKEY)]
    pub fee_destination: Account<'info, TokenAccount>,
    #[account(
        mut,
        address = ADMIN_PUBKEY
    )]
    pub admin: Signer<'info>,
    /// CHECK: arbitrarily assigned by existing admin
    pub new_admin: UncheckedAccount<'info>,
}

pub fn update_admin_config_handler(
    ctx: Context<UpdateAdminConfig>,
    updated_fee: u64,
) -> Result<()> {
    ctx.accounts.admin_config.admin = ctx.accounts.new_admin.key();
    ctx.accounts.admin_config.fee_destination = ctx.accounts.fee_destination.key();
    ctx.accounts.admin_config.fee_basis_points = updated_fee;
    Ok(())
}
