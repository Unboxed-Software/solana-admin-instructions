use anchor_lang::prelude::*;
mod instructions;
use instructions::*;
mod state;

declare_id!("FF3eGbZnharYruJNwRV7jqnDYvpLkyvgbSv5gsGbJHps");

#[cfg(not(feature = "local-testing"))]
#[constant]
pub const USDC_MINT_PUBKEY: Pubkey = pubkey!("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

#[cfg(feature = "local-testing")]
#[constant]
pub const USDC_MINT_PUBKEY: Pubkey = pubkey!("envYcAnc9BvWEqDy4VKJsiECCbbc72Fynz87rBih6DV");

pub const SEED_PROGRAM_CONFIG: &[u8] = b"program_config";

#[constant]
pub const ADMIN: Pubkey = pubkey!("GprrWv9r8BMxQiWea9MrbCyK7ig7Mj8CcseEbJhDDZXM");

#[program]
pub mod config {

    use super::*;

    pub fn payment(ctx: Context<Payment>, amount: u64) -> Result<()> {
        instructions::payment_handler(ctx, amount)
    }

    pub fn initialize_program_config(ctx: Context<InitializeProgramConfig>) -> Result<()> {
        instructions::initialize_program_config_handler(ctx)
    }

    pub fn update_program_config(ctx: Context<UpdateProgramConfig>, new_fee: u64) -> Result<()> {
        instructions::update_program_config_handler(ctx, new_fee)
    }
}