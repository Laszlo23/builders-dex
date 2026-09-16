import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BuilderRaise } from "../target/types/builder_raise";
import { PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert } from "chai";
import { createHash } from "crypto";

describe("builder-raise", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.builderRaise as Program<BuilderRaise>;
  const configAuthority = provider.wallet as anchor.Wallet;
  const oracle = Keypair.generate();
  const founder = Keypair.generate();
  const buyer = Keypair.generate();
  const stranger = Keypair.generate();

  const projectSeed = createHash("sha256").update("builders-dex:project:p5").digest();
  const applicationHash = createHash("sha256").update("builders-dex:application:app1").digest();

  let configPda: PublicKey;
  let raisePda: PublicKey;
  let vaultPda: PublicKey;
  let cert0: PublicKey;

  const fund = async (to: PublicKey, sol: number) => {
    const from = (provider.wallet as anchor.Wallet).payer;
    const ix = SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to,
      lamports: sol * LAMPORTS_PER_SOL,
    });
    await anchor.web3.sendAndConfirmTransaction(
      provider.connection,
      new anchor.web3.Transaction().add(ix),
      [from],
    );
  };

  before(async () => {
    await fund(oracle.publicKey, 1);
    await fund(founder.publicKey, 3);
    await fund(buyer.publicKey, 2);
    await fund(stranger.publicKey, 1);

    [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("raise-config")],
      program.programId,
    );
    [raisePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("raise"), founder.publicKey.toBuffer(), projectSeed],
      program.programId,
    );
    [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), raisePda.toBuffer()],
      program.programId,
    );
    [cert0] = PublicKey.findProgramAddressSync(
      [Buffer.from("share"), raisePda.toBuffer(), Buffer.from([0, 0, 0, 0])],
      program.programId,
    );
  });

  it("initializes config", async () => {
    await program.methods
      .initializeConfig(oracle.publicKey, 250, configAuthority.publicKey)
      .accounts({
        config: configPda,
        authority: configAuthority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    const cfg = await program.account.raiseConfig.fetch(configPda);
    assert.ok(cfg.oracle.equals(oracle.publicKey));
    assert.equal(cfg.platformFeeBps, 250);
  });

  it("creates a draft raise", async () => {
    await program.methods
      .createRaise(
        Array.from(projectSeed),
        new anchor.BN(50_000_000),
        10,
        2000,
        new anchor.BN(500_000_000),
        90,
        Array.from(applicationHash),
      )
      .accounts({
        raise: raisePda,
        vault: vaultPda,
        founder: founder.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([founder])
      .rpc();
    const raise = await program.account.raise.fetch(raisePda);
    assert.equal(Object.keys(raise.status)[0], "draft");
    assert.equal(raise.shareSupply, 10);
    assert.equal(raise.holderPoolBps, 2000);
  });

  it("rejects open_raise without oracle", async () => {
    try {
      await program.methods
        .openRaise()
        .accounts({
          raise: raisePda,
          config: configPda,
          oracle: stranger.publicKey,
        })
        .signers([stranger])
        .rpc();
      assert.fail("expected unauthorized open");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      assert.ok(/UnauthorizedOracle|custom program error/i.test(msg));
    }
  });

  it("opens raise with oracle", async () => {
    await program.methods
      .openRaise()
      .accounts({
        raise: raisePda,
        config: configPda,
        oracle: oracle.publicKey,
      })
      .signers([oracle])
      .rpc();
    const raise = await program.account.raise.fetch(raisePda);
    assert.equal(Object.keys(raise.status)[0], "live");
  });

  it("mints a share certificate", async () => {
    await program.methods
      .mintShare(0)
      .accounts({
        raise: raisePda,
        config: configPda,
        certificate: cert0,
        buyer: buyer.publicKey,
        founder: founder.publicKey,
        platformTreasury: configAuthority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();
    const cert = await program.account.shareCertificate.fetch(cert0);
    assert.ok(cert.owner.equals(buyer.publicKey));
    assert.equal(cert.serial, 0);
    const raise = await program.account.raise.fetch(raisePda);
    assert.equal(raise.sharesMinted, 1);
  });

  it("deposits a win and splits the holder pool", async () => {
    const deposit = 1_000_000_000;
    await program.methods
      .depositWin(new anchor.BN(deposit))
      .accounts({
        raise: raisePda,
        vault: vaultPda,
        founder: founder.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([founder])
      .rpc();
    const raise = await program.account.raise.fetch(raisePda);
    assert.ok(raise.accPerShare.gt(new anchor.BN(0)));
  });

  it("lets the holder claim exactly once", async () => {
    const before = await provider.connection.getBalance(buyer.publicKey);
    await program.methods
      .claim()
      .accounts({
        raise: raisePda,
        certificate: cert0,
        vault: vaultPda,
        owner: buyer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();
    const after = await provider.connection.getBalance(buyer.publicKey);
    assert.ok(after > before);

    try {
      await program.methods
        .claim()
        .accounts({
          raise: raisePda,
          certificate: cert0,
          vault: vaultPda,
          owner: buyer.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([buyer])
        .rpc();
      assert.fail("second claim should fail");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      assert.ok(/NothingToClaim|custom program error/i.test(msg));
    }
  });

  it("rejects unauthorized claim", async () => {
    try {
      await program.methods
        .claim()
        .accounts({
          raise: raisePda,
          certificate: cert0,
          vault: vaultPda,
          owner: stranger.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([stranger])
        .rpc();
      assert.fail("stranger should not claim");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      assert.ok(/UnauthorizedOwner|ConstraintSeeds|custom program error/i.test(msg));
    }
  });
});
