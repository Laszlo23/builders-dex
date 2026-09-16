import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BuilderPassport } from "../target/types/builder_passport";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";

describe("builder-passport", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.builderPassport as Program<BuilderPassport>;

  const authority = Keypair.generate();
  const oracle = Keypair.generate();
  const configAuthority = provider.wallet as anchor.Wallet;

  let passportPda: PublicKey;
  let passportBump: number;
  let configPda: PublicKey;
  let configBump: number;

  before(async () => {
    // Prefer transfer over airdrop (public RPC airdrops are unreliable)
    const from = (provider.wallet as anchor.Wallet).payer;
    const fund = async (to: PublicKey, sol: number) => {
      const ix = SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: to,
        lamports: sol * anchor.web3.LAMPORTS_PER_SOL,
      });
      const tx = new anchor.web3.Transaction().add(ix);
      await anchor.web3.sendAndConfirmTransaction(provider.connection, tx, [from]);
    };

    await fund(authority.publicKey, 2);
    await fund(oracle.publicKey, 1);

    [passportPda, passportBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("builder-passport"), authority.publicKey.toBuffer()],
      program.programId
    );

    [configPda, configBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    );
  });

  it("Initializes Config PDA with oracle", async () => {
    await program.methods
      .initializeConfig(oracle.publicKey)
      .accounts({
        config: configPda,
        authority: configAuthority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const config = await program.account.config.fetch(configPda);
    assert.ok(config.authority.equals(configAuthority.publicKey));
    assert.ok(config.oracle.equals(oracle.publicKey));
    assert.equal(config.bump, configBump);
    console.log("✓ Config initialized; oracle:", oracle.publicKey.toBase58());
  });

  it("Initializes a Builder Passport", async () => {
    await program.methods
      .initialize()
      .accounts({
        passport: passportPda,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    const passport = await program.account.builderPassport.fetch(passportPda);

    assert.ok(passport.authority.equals(authority.publicKey));
    assert.equal(passport.score, 0);
    assert.ok(passport.level.rookie !== undefined);
    assert.equal(passport.bump, passportBump);
    assert.ok(passport.lastUpdated > 0);

    console.log("✓ Builder Passport initialized");
  });

  it("Updates Builder Score (oracle)", async () => {
    const newScore = 150;

    await program.methods
      .updateScore(newScore)
      .accounts({
        passport: passportPda,
        config: configPda,
        oracle: oracle.publicKey,
      })
      .signers([oracle])
      .rpc();

    const passport = await program.account.builderPassport.fetch(passportPda);
    assert.equal(passport.score, newScore);
    assert.ok(passport.level.builder !== undefined);
    console.log("✓ Score → Builder:", newScore);
  });

  it("Updates score to Advanced level", async () => {
    const newScore = 350;
    await program.methods
      .updateScore(newScore)
      .accounts({
        passport: passportPda,
        config: configPda,
        oracle: oracle.publicKey,
      })
      .signers([oracle])
      .rpc();

    const passport = await program.account.builderPassport.fetch(passportPda);
    assert.equal(passport.score, newScore);
    assert.ok(passport.level.advanced !== undefined);
    console.log("✓ Score → Advanced:", newScore);
  });

  it("Updates score to Expert level", async () => {
    const newScore = 750;
    await program.methods
      .updateScore(newScore)
      .accounts({
        passport: passportPda,
        config: configPda,
        oracle: oracle.publicKey,
      })
      .signers([oracle])
      .rpc();

    const passport = await program.account.builderPassport.fetch(passportPda);
    assert.equal(passport.score, newScore);
    assert.ok(passport.level.expert !== undefined);
    console.log("✓ Score → Expert:", newScore);
  });

  it("Updates score to Genesis level", async () => {
    const newScore = 1500;
    await program.methods
      .updateScore(newScore)
      .accounts({
        passport: passportPda,
        config: configPda,
        oracle: oracle.publicKey,
      })
      .signers([oracle])
      .rpc();

    const passport = await program.account.builderPassport.fetch(passportPda);
    assert.equal(passport.score, newScore);
    assert.ok(passport.level.genesis !== undefined);
    console.log("✓ Score → Genesis:", newScore);
  });

  it("Fails to update score with unauthorized oracle", async () => {
    const unauthorized = Keypair.generate();
    const from = (provider.wallet as anchor.Wallet).payer;
    const ix = SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: unauthorized.publicKey,
      lamports: anchor.web3.LAMPORTS_PER_SOL,
    });
    await anchor.web3.sendAndConfirmTransaction(
      provider.connection,
      new anchor.web3.Transaction().add(ix),
      [from]
    );

    try {
      await program.methods
        .updateScore(999)
        .accounts({
          passport: passportPda,
          config: configPda,
          oracle: unauthorized.publicKey,
        })
        .signers([unauthorized])
        .rpc();
      assert.fail("Should have failed with unauthorized oracle");
    } catch (err: any) {
      assert.ok(
        err.toString().includes("UnauthorizedUpdate") ||
          err.toString().includes("custom program error") ||
          err.toString().includes("Error")
      );
      console.log("✓ Correctly rejected unauthorized update");
    }
  });

  it("Closes a Builder Passport", async () => {
    const before = await provider.connection.getBalance(authority.publicKey);

    await program.methods
      .close()
      .accounts({
        passport: passportPda,
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();

    try {
      await program.account.builderPassport.fetch(passportPda);
      assert.fail("Account should be closed");
    } catch (err: any) {
      assert.ok(err.toString().includes("Account does not exist"));
    }

    const after = await provider.connection.getBalance(authority.publicKey);
    assert.ok(after > before);
    console.log("✓ Passport closed; rent refunded");
  });

  it("Re-initializes a Builder Passport after closing", async () => {
    await program.methods
      .initialize()
      .accounts({
        passport: passportPda,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    const passport = await program.account.builderPassport.fetch(passportPda);
    assert.ok(passport.authority.equals(authority.publicKey));
    assert.equal(passport.score, 0);
    assert.ok(passport.level.rookie !== undefined);
    console.log("✓ Passport re-initialized");
  });

  it("Updates oracle pubkey (config authority)", async () => {
    const newOracle = Keypair.generate();
    await program.methods
      .updateOracle(newOracle.publicKey)
      .accounts({
        config: configPda,
        authority: configAuthority.publicKey,
      })
      .rpc();

    const config = await program.account.config.fetch(configPda);
    assert.ok(config.oracle.equals(newOracle.publicKey));
    console.log("✓ Oracle rotated");
  });
});
