use anchor_lang::prelude::*;

const DISCRIMINATOR_SIZE: usize = 8;

#[account]
#[derive(InitSpace)]
pub struct AdminConfig {
    pub admin: Pubkey,
    pub fee_destination: Pubkey,
    pub fee_basis_points: u64,
}

impl AdminConfig {
    pub const LEN: usize = DISCRIMINATOR_SIZE + AdminConfig::INIT_SPACE;
}
