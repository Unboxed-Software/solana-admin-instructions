import * as anchor from "@project-serum/anchor"
import * as spl from "@solana/spl-token"
import { Program } from "@project-serum/anchor"
import { Config } from "../target/types/config"
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey"
import { assert } from "chai"
import { execSync } from "child_process"
const fs = require("fs")

const deploy = () => {
  const deployCmd = `solana program deploy --url localhost -v --program-id $(pwd)/target/deploy/config-keypair.json $(pwd)/target/deploy/config.so`
  execSync(deployCmd)
}

describe("config", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env())
  const connection = anchor.getProvider().connection
  const wallet = anchor.workspace.Config.provider.wallet

  const program = anchor.workspace.Config as Program<Config>
  const programDataAddress = findProgramAddressSync(
    [program.programId.toBytes()],
    new anchor.web3.PublicKey("BPFLoaderUpgradeab1e11111111111111111111111")
  )[0]

  const adminConfig = findProgramAddressSync(
    [Buffer.from("admin")],
    program.programId
  )[0]

  const tokenAccount = anchor.web3.Keypair.generate()
  let mint: anchor.web3.PublicKey
  let feeDestination: anchor.web3.PublicKey

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

    feeDestination = await spl.createAccount(
      connection,
      wallet.payer,
      mint,
      wallet.publicKey
    )

    deploy()
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

  it("Reads ProgramData and sets field", async () => {
    const tx = await program.methods
      .initializeAdminConfig()
      .accounts({
        adminConfig: adminConfig,
        feeDestination: feeDestination,
        authority: wallet.publicKey,
        program: program.programId,
        programData: programDataAddress,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()

    assert.strictEqual(
      (
        await program.account.adminConfig.fetch(adminConfig)
      ).feeBasisPoints.toNumber(),
      100
    )
    assert.strictEqual(
      (await program.account.adminConfig.fetch(adminConfig)).admin.toString(),
      wallet.publicKey.toString()
    )
  })
})
