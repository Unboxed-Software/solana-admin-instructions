use anchor_lang::prelude::*;
mod instructions;
mod state;
use instructions::*;

declare_id!("EkMrFPLyepdLUpEujQzuwTmbHKzAeaqXSXCf3JPKdULZ");

#[cfg(feature = "local-testing")]
#[constant]
pub const USDC_MINT_PUBKEY: Pubkey = pubkey!("envdsQqsysKjFMcPSo34yPyjenZpaWg9J1TgtKMFgZp");

#[cfg(not(feature = "local-testing"))]
#[constant]
pub const USDC_MINT_PUBKEY: Pubkey = pubkey!("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

#[constant]
pub const ADMIN_PUBKEY: Pubkey = pubkey!("DfLZV18rD7wCQwjYvhTFwuvLh49WSbXFeJFPQb5czifH");

#[program]
pub mod config {
    use super::*;

    pub fn initialize_admin_config(ctx: Context<InitializeAdminConfig>) -> Result<()> {
        instructions::initialize_admin_config_handler(ctx)
    }

    pub fn update_admin_config(ctx: Context<UpdateAdminConfig>, updated_fee: u64) -> Result<()> {
        instructions::update_admin_config_handler(ctx, updated_fee)
    }

    pub fn payment(ctx: Context<Payment>, amount: u64) -> Result<()> {
        instructions::payment_handler(ctx, amount)
    }
}
