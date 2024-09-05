use crate::state::AdminConfig;
use crate::ADMIN_PUBKEY;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct UpdateAdminConfig<'info> {
    #[account(mut, seeds = [b"admin_config"], bump)]
    pub admin_config: Account<'info, AdminConfig>,
    #[account(
        mut,
        address = ADMIN_PUBKEY
    )]
    pub admin: Signer<'info>,
}

pub fn update_admin_config_handler(
    ctx: Context<UpdateAdminConfig>,
    updated_fee: u64,
) -> Result<()> {
    ctx.accounts.admin_config.fee_basis_points = updated_fee;
    Ok(())
}
