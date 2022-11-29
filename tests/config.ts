import * as anchor from "@project-serum/anchor"
import * as spl from "@solana/spl-token"
import { Program } from "@project-serum/anchor"
import { Config } from "../target/types/config"
const fs = require("fs")

describe("config", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env())
  const connection = anchor.getProvider().connection
  const program = anchor.workspace.Config as Program<Config>
  const wallet = anchor.workspace.Config.provider.wallet

  const tokenAccount = anchor.web3.Keypair.generate()
  let mint: anchor.web3.PublicKey

  before(async () => {
    let rawdata = fs.readFileSync(
      "tests/keys/test-WaoKNLQVDyBx388CfjaVeyNbs3MT2mPgAhoCfXyUvg8.json"
    )
    let keyData = JSON.parse(rawdata)
    let key = anchor.web3.Keypair.fromSecretKey(new Uint8Array(keyData))

    mint = await spl.createMint(
      connection,
      wallet.payer,
      wallet.publicKey,
      null,
      0,
      key
    )
  })

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods
      .initialize()
      .accounts({
        token: tokenAccount.publicKey,
        mint: mint,
      })
      .signers([tokenAccount])
      .rpc()
    // console.log("Your transaction signature", tx)
  })
})
