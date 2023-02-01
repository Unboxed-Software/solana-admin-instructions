import * as anchor from "@project-serum/anchor"
import * as spl from "@solana/spl-token"
import { Program } from "@project-serum/anchor"
import { Config } from "../target/types/config"
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey"
import { assert, expect } from "chai"
import { execSync } from "child_process"
const fs = require("fs")

describe("config", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env())
  const connection = anchor.getProvider().connection
  const wallet = anchor.workspace.Config.provider.wallet

  const program = anchor.workspace.Config as Program<Config>

  const sender = anchor.web3.Keypair.generate()
  const receiver = anchor.web3.Keypair.generate()

  let feeDestination: anchor.web3.PublicKey
  let senderTokenAccount: anchor.web3.PublicKey
  let receiverTokenAccount: anchor.web3.PublicKey

  before(async () => {
    const mint = new anchor.web3.PublicKey(
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
    )

    feeDestination = await spl.createAccount(
      connection,
      wallet.payer,
      mint,
      wallet.publicKey
    )

    senderTokenAccount = await spl.createAccount(
      connection,
      wallet.payer,
      mint,
      sender.publicKey
    )

    receiverTokenAccount = await spl.createAccount(
      connection,
      wallet.payer,
      mint,
      receiver.publicKey
    )

    await spl.mintTo(
      connection,
      wallet.payer,
      mint,
      senderTokenAccount,
      wallet.payer,
      10000
    )

    await connection.confirmTransaction(
      await connection.requestAirdrop(
        sender.publicKey,
        1 * anchor.web3.LAMPORTS_PER_SOL
      ),
      "confirmed"
    )
  })

  it("Payment completes successfully", async () => {
    try {
      const tx = await program.methods
        .payment(new anchor.BN(10000))
        .accounts({
          feeDestination: feeDestination,
          senderTokenAccount: senderTokenAccount,
          receiverTokenAccount: receiverTokenAccount,
          sender: sender.publicKey,
        })
        .transaction()

      await anchor.web3.sendAndConfirmTransaction(connection, tx, [sender])

      assert.strictEqual(
        (await connection.getTokenAccountBalance(senderTokenAccount)).value
          .uiAmount,
        0
      )

      assert.strictEqual(
        (await connection.getTokenAccountBalance(feeDestination)).value
          .uiAmount,
        100
      )

      assert.strictEqual(
        (await connection.getTokenAccountBalance(receiverTokenAccount)).value
          .uiAmount,
        9900
      )
    } catch (err) {
      console.log(err)
    }
  })
})
