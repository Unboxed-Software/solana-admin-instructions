import * as anchor from "@coral-xyz/anchor";
import { createAccount, mintTo, getAccount } from "@solana/spl-token";
import { Program } from "@coral-xyz/anchor";
import { Config } from "../target/types/config";
import { expect } from "chai";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { airdropIfRequired } from "@solana-developers/helpers";
import { execSync } from "child_process";
import fs from "fs";

describe("Config", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Config as Program<Config>;
  const connection = provider.connection;
  const walletAuthority = provider.wallet as anchor.Wallet;

  const sender = anchor.web3.Keypair.generate();
  const receiver = anchor.web3.Keypair.generate();

  let feeDestination: PublicKey;
  let senderTokenAccount: PublicKey;
  let receiverTokenAccount: PublicKey;

  const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
  const INITIAL_SENDER_BALANCE = 10000;
  const PAYMENT_AMOUNT = 10000;
  const FEE_PERCENTAGE = 0.01; // 1%

  before(async () => {
    try {
      feeDestination = await createAccount(
        connection,
        walletAuthority.payer,
        USDC_MINT,
        walletAuthority.publicKey
      );

      senderTokenAccount = await createAccount(
        connection,
        walletAuthority.payer,
        USDC_MINT,
        sender.publicKey
      );

      receiverTokenAccount = await createAccount(
        connection,
        walletAuthority.payer,
        USDC_MINT,
        receiver.publicKey
      );

      await mintTo(
        connection,
        walletAuthority.payer,
        USDC_MINT,
        senderTokenAccount,
        walletAuthority.payer,
        INITIAL_SENDER_BALANCE
      );

      await airdropIfRequired(
        connection,
        sender.publicKey,
        1 * LAMPORTS_PER_SOL,
        0.5 * LAMPORTS_PER_SOL
      );
    } catch (error) {
      console.error("Setup failed:", error);
      throw error;
    }
  });

  it("completes payment successfully", async () => {
    try {
      const transaction = await program.methods
        .payment(new anchor.BN(PAYMENT_AMOUNT))
        .accounts({
          feeDestination: feeDestination,
          senderTokenAccount: senderTokenAccount,
          receiverTokenAccount: receiverTokenAccount,
          sender: sender.publicKey,
        })
        .transaction();

      await anchor.web3.sendAndConfirmTransaction(connection, transaction, [sender]);

      const senderBalance = await getAccount(connection, senderTokenAccount);
      const feeDestinationBalance = await getAccount(connection, feeDestination);
      const receiverBalance = await getAccount(connection, receiverTokenAccount);

      expect(Number(senderBalance.amount)).to.equal(0);
      expect(Number(feeDestinationBalance.amount)).to.equal(PAYMENT_AMOUNT * FEE_PERCENTAGE);
      expect(Number(receiverBalance.amount)).to.equal(PAYMENT_AMOUNT * (1 - FEE_PERCENTAGE));
    } catch (error) {
      console.error("Payment failed:", error);
      throw error;
    }
  });
});