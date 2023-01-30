use crate::state::ProgramConfig;
use crate::SEED_PROGRAM_CONFIG;
use anchor_lang::prelude::*;
#[derive(Accounts)]
pub struct UpdateProgramConfigFee<'info> {
    #[account(mut, seeds = [SEED_PROGRAM_CONFIG], bump)]
    pub program_config: Account<'info, ProgramConfig>,
    #[account(
        mut,
        address = program_config.admin,
    )]
    pub admin: Signer<'info>,
}

pub fn update_program_config_fee_handler(
    ctx: Context<UpdateProgramConfigFee>,
    updated_fee: u64,
) -> Result<()> {
    ctx.accounts.program_config.fee_basis_points = updated_fee;
    Ok(())
}
