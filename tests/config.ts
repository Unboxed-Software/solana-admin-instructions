import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Config } from "../target/types/config";
import { expect } from "chai";
import { LAMPORTS_PER_SOL, PublicKey, Keypair } from "@solana/web3.js";
import {
  createMint,
  createAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";
import { airdropIfRequired } from "@solana-developers/helpers";
import { execSync } from "child_process";
import fs from "fs";

describe("Config", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Config as Program<Config>;
  const connection = provider.connection;
  const walletAuthority = provider.wallet as anchor.Wallet;

  const sender = Keypair.generate();
  const receiver = Keypair.generate();

  let feeDestination: PublicKey;
  let senderTokenAccount: PublicKey;
  let receiverTokenAccount: PublicKey;
  let tokenMint: PublicKey;

  const PROGRAM_CONFIG_SEED = "program_config";
  const [programConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from(PROGRAM_CONFIG_SEED)],
    program.programId
  );

  const INITIAL_SENDER_BALANCE = 10000;
  const PAYMENT_AMOUNT = 10000;
  const INITIAL_FEE_BASIS_POINTS = 100;
  const UPDATED_FEE_BASIS_POINTS = 200;

  const deploy = () => {
    const deployCmd = `solana program deploy --url localhost -v --program-id $(pwd)/target/deploy/config-keypair.json $(pwd)/target/deploy/config.so`;
    execSync(deployCmd);
  };

  before(async () => {
    try {
      deploy();
      const mintKeypairData = fs.readFileSync(
        "envYcAnc9BvWEqDy4VKJsiECCbbc72Fynz87rBih6DV.json"
      );
      const mintKeypair = Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(mintKeypairData))
      );

      tokenMint = await createMint(
        connection,
        walletAuthority.payer,
        walletAuthority.publicKey,
        null,
        0,
        mintKeypair
      );

      feeDestination = await createAccount(
        connection,
        walletAuthority.payer,
        tokenMint,
        walletAuthority.publicKey
      );

      senderTokenAccount = await createAccount(
        connection,
        walletAuthority.payer,
        tokenMint,
        sender.publicKey
      );

      receiverTokenAccount = await createAccount(
        connection,
        walletAuthority.payer,
        tokenMint,
        receiver.publicKey
      );

      await mintTo(
        connection,
        walletAuthority.payer,
        tokenMint,
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

  it("initializes program config account", async () => {
    try {
      await program.methods
        .initializeProgramConfig()
        .accounts({
          programConfig: programConfig,
          feeDestination: feeDestination,
          authority: walletAuthority.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const configAccount = await program.account.programConfig.fetch(
        programConfig
      );
      expect(configAccount.feeBasisPoints.toNumber()).to.equal(
        INITIAL_FEE_BASIS_POINTS
      );
      expect(configAccount.admin.toString()).to.equal(
        walletAuthority.publicKey.toString()
      );
    } catch (error) {
      console.error("Program config initialization failed:", error);
      throw error;
    }
  });

  it("completes payment successfully", async () => {
    try {
      const transaction = await program.methods
        .payment(new anchor.BN(PAYMENT_AMOUNT))
        .accounts({
          programConfig: programConfig,
          feeDestination: feeDestination,
          senderTokenAccount: senderTokenAccount,
          receiverTokenAccount: receiverTokenAccount,
          sender: sender.publicKey,
        })
        .transaction();

      await anchor.web3.sendAndConfirmTransaction(connection, transaction, [
        sender,
      ]);

      const senderBalance = await getAccount(connection, senderTokenAccount);
      const feeDestinationBalance = await getAccount(
        connection,
        feeDestination
      );
      const receiverBalance = await getAccount(
        connection,
        receiverTokenAccount
      );

      expect(Number(senderBalance.amount)).to.equal(0);
      expect(Number(feeDestinationBalance.amount)).to.equal(
        (PAYMENT_AMOUNT * INITIAL_FEE_BASIS_POINTS) / 10000
      );
      expect(Number(receiverBalance.amount)).to.equal(
        (PAYMENT_AMOUNT * (10000 - INITIAL_FEE_BASIS_POINTS)) / 10000
      );
    } catch (error) {
      console.error("Payment failed:", error);
      throw error;
    }
  });

  it("updates program config account", async () => {
    try {
      await program.methods
        .updateProgramConfig(new anchor.BN(UPDATED_FEE_BASIS_POINTS))
        .accounts({
          programConfig: programConfig,
          admin: walletAuthority.publicKey,
          feeDestination: feeDestination,
          newAdmin: walletAuthority.publicKey,
        })
        .rpc();

      const configAccount = await program.account.programConfig.fetch(
        programConfig
      );
      expect(configAccount.feeBasisPoints.toNumber()).to.equal(
        UPDATED_FEE_BASIS_POINTS
      );
    } catch (error) {
      console.error("Program config update failed:", error);
      throw error;
    }
  });

  it("fails to update program config account with unauthorized admin", async () => {
    try {
      const transaction = await program.methods
        .updateProgramConfig(new anchor.BN(300))
        .accounts({
          programConfig: programConfig,
          admin: sender.publicKey,
          feeDestination: feeDestination,
          newAdmin: sender.publicKey,
        })
        .transaction();

      await anchor.web3.sendAndConfirmTransaction(connection, transaction, [
        sender,
      ]);
      throw new Error("Expected transaction to fail, but it succeeded");
    } catch (error) {
      expect(error).to.exist;
      console.log("Transaction failed as expected:", error.message);
    }
  });
});
