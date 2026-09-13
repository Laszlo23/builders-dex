import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BuilderPassport } from "../target/types/builder_passport";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";

describe("builder-passport", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.builderPassport as Program<BuilderPassport>;
  
  // Test accounts
  const authority = Keypair.generate();
  const admin = provider.wallet.publicKey;
  
  // PDA for the builder passport
  let passportPda: PublicKey;
  let passportBump: number;

  before(async () => {
    // Airdrop SOL to authority for testing
    const signature = await provider.connection.requestAirdrop(
      authority.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);

    // Derive PDA
    [passportPda, passportBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("builder-passport"), authority.publicKey.toBuffer()],
      program.programId
    );
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
    assert.equal(passport.level.rookie !== undefined, true);
    assert.equal(passport.bump, passportBump);
    assert.ok(passport.lastUpdated > 0);
    
    console.log("✓ Builder Passport initialized successfully");
    console.log("  - Authority:", passport.authority.toBase58());
    console.log("  - Initial Score:", passport.score);
    console.log("  - Level: Rookie");
  });

  it("Updates Builder Score (admin)", async () => {
    const newScore = 150;
    
    await program.methods
      .updateScore(newScore)
      .accounts({
        passport: passportPda,
        authority: authority.publicKey,
        admin: admin,
      })
      .rpc();

    const passport = await program.account.builderPassport.fetch(passportPda);
    
    assert.equal(passport.score, newScore);
    assert.equal(passport.level.builder !== undefined, true);
    
    console.log("✓ Score updated to:", newScore);
    console.log("  - New Level: Builder");
  });

  it("Updates score to Advanced level", async () => {
    const newScore = 350;
    
    await program.methods
      .updateScore(newScore)
      .accounts({
        passport: passportPda,
        authority: authority.publicKey,
        admin: admin,
      })
      .rpc();

    const passport = await program.account.builderPassport.fetch(passportPda);
    
    assert.equal(passport.score, newScore);
    assert.equal(passport.level.advanced !== undefined, true);
    
    console.log("✓ Score updated to:", newScore);
    console.log("  - New Level: Advanced");
  });

  it("Updates score to Expert level", async () => {
    const newScore = 750;
    
    await program.methods
      .updateScore(newScore)
      .accounts({
        passport: passportPda,
        authority: authority.publicKey,
        admin: admin,
      })
      .rpc();

    const passport = await program.account.builderPassport.fetch(passportPda);
    
    assert.equal(passport.score, newScore);
    assert.equal(passport.level.expert !== undefined, true);
    
    console.log("✓ Score updated to:", newScore);
    console.log("  - New Level: Expert");
  });

  it("Updates score to Genesis level", async () => {
    const newScore = 1500;
    
    await program.methods
      .updateScore(newScore)
      .accounts({
        passport: passportPda,
        authority: authority.publicKey,
        admin: admin,
      })
      .rpc();

    const passport = await program.account.builderPassport.fetch(passportPda);
    
    assert.equal(passport.score, newScore);
    assert.equal(passport.level.genesis !== undefined, true);
    
    console.log("✓ Score updated to:", newScore);
    console.log("  - New Level: Genesis");
  });

  it("Fails to update score with unauthorized admin", async () => {
    const unauthorizedAdmin = Keypair.generate();
    
    // Airdrop to unauthorized admin
    const sig = await provider.connection.requestAirdrop(
      unauthorizedAdmin.publicKey,
      anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(sig);
    
    try {
      await program.methods
        .updateScore(999)
        .accounts({
          passport: passportPda,
          authority: authority.publicKey,
          admin: unauthorizedAdmin.publicKey,
        })
        .signers([unauthorizedAdmin])
        .rpc();
      
      assert.fail("Should have failed with unauthorized admin");
    } catch (err) {
      assert.ok(err.toString().includes("UnauthorizedUpdate"));
      console.log("✓ Correctly rejected unauthorized update");
    }
  });

  it("Closes a Builder Passport", async () => {
    const authorityBalanceBefore = await provider.connection.getBalance(authority.publicKey);
    
    await program.methods
      .close()
      .accounts({
        passport: passportPda,
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();

    // Verify account is closed
    try {
      await program.account.builderPassport.fetch(passportPda);
      assert.fail("Account should be closed");
    } catch (err) {
      assert.ok(err.toString().includes("Account does not exist"));
    }
    
    const authorityBalanceAfter = await provider.connection.getBalance(authority.publicKey);
    assert.ok(authorityBalanceAfter > authorityBalanceBefore);
    
    console.log("✓ Builder Passport closed successfully");
    console.log("  - Rent refunded to authority");
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
    assert.equal(passport.level.rookie !== undefined, true);
    
    console.log("✓ Builder Passport re-initialized successfully");
  });
});
