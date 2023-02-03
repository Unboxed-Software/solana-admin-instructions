use crate::state::ProgramConfig;
use crate::SEED_PROGRAM_CONFIG;
use anchor_lang::prelude::*;
#[derive(Accounts)]
pub struct UpdateProgramConfig<'info> {
    #[account(mut, seeds = [SEED_PROGRAM_CONFIG], bump)]
    pub program_config: Account<'info, ProgramConfig>,
    #[account(
        mut,
        address = program_config.admin,
    )]
    pub admin: Signer<'info>,
}

pub fn update_program_config_handler(
    ctx: Context<UpdateProgramConfig>,
    program_config: ProgramConfig,
) -> Result<()> {
    ctx.accounts.program_config.admin = program_config.admin;
    ctx.accounts.program_config.fee_destination = program_config.fee_destination;
    ctx.accounts.program_config.fee_basis_points = program_config.fee_basis_points;
    Ok(())
}
