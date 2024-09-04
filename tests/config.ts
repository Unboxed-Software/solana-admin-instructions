import * as anchor from "@coral-xyz/anchor";
import * as spl from "@solana/spl-token";
import { Program } from "@coral-xyz/anchor";
import { Config } from "../target/types/config";
import { assert, expect } from "chai";
import { execSync } from "child_process";
import { PublicKey } from "@solana/web3.js";
const fs = require("fs");

const deploy = () => {
  const deployCmd = `solana program deploy --url localhost -v --program-id $(pwd)/target/deploy/config-keypair.json $(pwd)/target/deploy/config.so`;
  execSync(deployCmd);
};

describe("config", () => {
  deploy();
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const connection = anchor.getProvider().connection;
  const wallet = anchor.workspace.Config.provider.wallet;

  const program = anchor.workspace.Config as Program<Config>;
  const programDataAddress = PublicKey.findProgramAddressSync(
    [program.programId.toBytes()],
    new anchor.web3.PublicKey("BPFLoaderUpgradeab1e11111111111111111111111")
  )[0];

  const adminConfig = PublicKey.findProgramAddressSync(
    [Buffer.from("admin_config")],
    program.programId
  )[0];

  const tokenAccount = anchor.web3.Keypair.generate();

  const sender = anchor.web3.Keypair.generate();
  const receiver = anchor.web3.Keypair.generate();

  let mint: anchor.web3.PublicKey;
  let feeDestination: anchor.web3.PublicKey;
  let senderTokenAccount: anchor.web3.PublicKey;
  let receiverTokenAccount: anchor.web3.PublicKey;

  before(async () => {
    let rawdata = fs.readFileSync(
      "tests/keys/test-WaoKNLQVDyBx388CfjaVeyNbs3MT2mPgAhoCfXyUvg8.json"
    );
    let keyData = JSON.parse(rawdata);
    let key = anchor.web3.Keypair.fromSecretKey(new Uint8Array(keyData));
    mint = await spl.createMint(
      connection,
      wallet.payer,
      wallet.publicKey,
      null,
      0,
      key
    );

    feeDestination = await spl.createAccount(
      connection,
      wallet.payer,
      mint,
      wallet.publicKey
    );

    senderTokenAccount = await spl.createAccount(
      connection,
      wallet.payer,
      mint,
      sender.publicKey
    );

    receiverTokenAccount = await spl.createAccount(
      connection,
      wallet.payer,
      mint,
      receiver.publicKey
    );

    await spl.mintTo(
      connection,
      wallet.payer,
      mint,
      senderTokenAccount,
      wallet.payer,
      10000
    );

    const airdropSignature = await connection.requestAirdrop(
      sender.publicKey,
      1 * anchor.web3.LAMPORTS_PER_SOL
    );

    const latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction(
      {
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: airdropSignature,
      },
      "confirmed"
    );
  });

  it("Initialize Admin config should be successfully", async () => {
    const tx = await program.methods
      .initializeAdminConfig()
      .accounts({
        feeDestination: feeDestination,
      })
      .rpc();

    assert.strictEqual(
      (
        await program.account.adminConfig.fetch(adminConfig)
      ).feeBasisPoints.toNumber(),
      100
    );
    assert.strictEqual(
      (await program.account.adminConfig.fetch(adminConfig)).admin.toString(),
      wallet.publicKey.toString()
    );
  });

  it("Payment should complete successfully", async () => {
    try {
      const tx = await program.methods
        .payment(new anchor.BN(10000))
        .accounts({
          senderTokenAccount: senderTokenAccount,
          receiverTokenAccount: receiverTokenAccount,
          sender: sender.publicKey,
        })
        .transaction();

      await anchor.web3.sendAndConfirmTransaction(connection, tx, [sender]);

      assert.strictEqual(
        (await connection.getTokenAccountBalance(senderTokenAccount)).value
          .uiAmount,
        0
      );

      assert.strictEqual(
        (await connection.getTokenAccountBalance(feeDestination)).value
          .uiAmount,
        100
      );

      assert.strictEqual(
        (await connection.getTokenAccountBalance(receiverTokenAccount)).value
          .uiAmount,
        9900
      );
    } catch (err) {
      assert.fail(err);
    }
  });
});
