use anchor_lang::prelude::*;
use solana_program::{pubkey, pubkey::Pubkey};
mod instructions;
use instructions::*;
mod state;
use state::*;

declare_id!("E6W4RLUxZLQN5mjVfTAv7hTrdLR5Y6nrNvFiW8p1Q1m");

#[cfg(not(feature = "local-testing"))]
#[constant]
pub const USDC_MINT_PUBKEY: Pubkey = pubkey!("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

#[cfg(feature = "local-testing")]
#[constant]
pub const USDC_MINT_PUBKEY: Pubkey = pubkey!("envK7QRnj5Vm7m7yrB2bTn8YUpM6AYFW7WW1NK8YgTY");

pub const SEED_PROGRAM_CONFIG: &[u8] = b"program_config";

#[constant]
pub const ADMIN: Pubkey = pubkey!("A6iNaXJj2jgLVadXRF7C2gMEwFUUL68YkfT5PAWvkuiZ");

#[program]
pub mod config {

    use super::*;

    pub fn payment(ctx: Context<Payment>, amount: u64) -> Result<()> {
        instructions::payment_handler(ctx, amount)
    }

    pub fn initialize_program_config(ctx: Context<InitializeProgramConfig>) -> Result<()> {
        instructions::initialize_program_config_handler(ctx)
    }

    pub fn update_program_config(
        ctx: Context<UpdateProgramConfig>,
        program_config: ProgramConfig,
    ) -> Result<()> {
        instructions::update_program_config_handler(ctx, program_config)
    }
}
