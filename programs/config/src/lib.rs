use anchor_lang::prelude::*;
mod instructions;
use instructions::*;

declare_id!("FF3eGbZnharYruJNwRV7jqnDYvpLkyvgbSv5gsGbJHps");

pub const USDC_MINT_PUBKEY: Pubkey = pubkey!("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

#[program]
pub mod config {
    use super::*;

    pub fn payment(ctx: Context<Payment>, amount: u64) -> Result<()> {
        instructions::payment_handler(ctx, amount)
    }
}