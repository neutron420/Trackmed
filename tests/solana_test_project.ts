import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaTestProject } from "../target/types/solana_test_project";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";

describe("solana_test_project", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolanaTestProject as Program<SolanaTestProject>;

  const manufacturer = provider.wallet;

  // Test data for batch registration
  const batchId = "BATCH001";
  const manufacturingDate = new anchor.BN(Math.floor(Date.now() / 1000) - 86400 * 30); // 30 days ago
  const expiryDate = new anchor.BN(Math.floor(Date.now() / 1000) + 86400 * 365); // 1 year from now
  const quantity = new anchor.BN(1000); // 1000 units
  const mrp = new anchor.BN(50000); // 500.00 in smallest unit (paise/cents)
  const metadataHash = "QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o"; // IPFS CID

  it("Registers a manufacturer", async () => {
    const [registryPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("manufacturer"),
        manufacturer.publicKey.toBuffer(),
      ],
      program.programId
    );

    const tx = await program.methods
      .registerManufacturer()
      .accounts({
        registry: registryPda,
        manufacturer: manufacturer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    console.log("   Manufacturer registered!");
    console.log("   Registry PDA:", registryPda.toString());
    console.log("   Transaction:", tx);

    // Verify the registry account was created
    const registryAccount = await program.account.manufacturerRegistry.fetch(registryPda);
    expect(registryAccount.manufacturer.toString()).to.equal(manufacturer.publicKey.toString());
    expect(registryAccount.isVerified).to.be.true;
    console.log("   Manufacturer verified:", registryAccount.isVerified);
  });

  it("Registers a new batch with full data", async () => {
    const [batchPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("batch"),
        manufacturer.publicKey.toBuffer(),
        Buffer.from(batchId),
      ],
      program.programId
    );

    const [registryPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("manufacturer"),
        manufacturer.publicKey.toBuffer(),
      ],
      program.programId
    );

    const tx = await program.methods
      .registerBatch(
        batchId,
        manufacturingDate,
        expiryDate,
        quantity,
        mrp,
        metadataHash // Optional metadata hash
      )
      .accounts({
        batch: batchPda,
        registry: registryPda,
        manufacturer: manufacturer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    console.log("   Batch registered!");
    console.log("   Batch PDA:", batchPda.toString());
    console.log("   Transaction:", tx);

    // Verify the batch account was created with all fields
    const batchAccount = await program.account.batch.fetch(batchPda);
    expect(batchAccount.batchHash).to.equal(batchId);
    expect(batchAccount.manufacturerWallet.toString()).to.equal(manufacturer.publicKey.toString());
    expect(batchAccount.metadataHash).to.equal(metadataHash);
    expect(batchAccount.manufacturingDate.toString()).to.equal(manufacturingDate.toString());
    expect(batchAccount.expiryDate.toString()).to.equal(expiryDate.toString());
    expect(batchAccount.quantity.toString()).to.equal(quantity.toString());
    expect(batchAccount.mrp.toString()).to.equal(mrp.toString());
    expect(batchAccount.status).to.deep.equal({ valid: {} });
    console.log("   Batch Status:", batchAccount.status);
    console.log("   Quantity:", batchAccount.quantity.toString());
    console.log("   MRP:", batchAccount.mrp.toString());
    console.log("   Metadata Hash:", batchAccount.metadataHash);
  });

  it("Registers a batch without metadata hash", async () => {
    const batchIdNoMeta = "BATCH_NO_META";
    const [batchPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("batch"),
        manufacturer.publicKey.toBuffer(),
        Buffer.from(batchIdNoMeta),
      ],
      program.programId
    );

    const [registryPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("manufacturer"),
        manufacturer.publicKey.toBuffer(),
      ],
      program.programId
    );

    const tx = await program.methods
      .registerBatch(
        batchIdNoMeta,
        manufacturingDate,
        expiryDate,
        quantity,
        mrp,
        null // No metadata hash
      )
      .accounts({
        batch: batchPda,
        registry: registryPda,
        manufacturer: manufacturer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    console.log("   Batch without metadata registered!");
    console.log("   Transaction:", tx);

    const batchAccount = await program.account.batch.fetch(batchPda);
    expect(batchAccount.metadataHash).to.be.null;
    console.log("   Metadata Hash is null as expected");
  });

  it("Suspends a batch", async () => {
    const [batchPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("batch"),
        manufacturer.publicKey.toBuffer(),
        Buffer.from(batchId),
      ],
      program.programId
    );

    const tx = await program.methods
      .updateBatchStatus(batchId, { suspended: {} })
      .accounts({
        batch: batchPda,
        manufacturer: manufacturer.publicKey,
      } as any)
      .rpc();

    console.log("   Batch suspended!");
    console.log("   Transaction:", tx);

    const batchAccount = await program.account.batch.fetch(batchPda);
    expect(batchAccount.status).to.deep.equal({ suspended: {} });
    console.log("   New Status:", batchAccount.status);
  });

  it("Reactivates a suspended batch", async () => {
    const [batchPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("batch"),
        manufacturer.publicKey.toBuffer(),
        Buffer.from(batchId),
      ],
      program.programId
    );

    const tx = await program.methods
      .updateBatchStatus(batchId, { valid: {} })
      .accounts({
        batch: batchPda,
        manufacturer: manufacturer.publicKey,
      } as any)
      .rpc();

    console.log("   Batch reactivated!");
    console.log("   Transaction:", tx);

    const batchAccount = await program.account.batch.fetch(batchPda);
    expect(batchAccount.status).to.deep.equal({ valid: {} });
    console.log("   New Status:", batchAccount.status);
  });

  it("Recalls a batch (terminal state)", async () => {
    const [batchPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("batch"),
        manufacturer.publicKey.toBuffer(),
        Buffer.from(batchId),
      ],
      program.programId
    );

    const tx = await program.methods
      .updateBatchStatus(batchId, { recalled: {} })
      .accounts({
        batch: batchPda,
        manufacturer: manufacturer.publicKey,
      } as any)
      .rpc();

    console.log("   Batch recalled!");
    console.log("   Transaction:", tx);

    const batchAccount = await program.account.batch.fetch(batchPda);
    expect(batchAccount.status).to.deep.equal({ recalled: {} });
    console.log("   New Status:", batchAccount.status);
  });

  it("Fails to modify a recalled batch", async () => {
    const [batchPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("batch"),
        manufacturer.publicKey.toBuffer(),
        Buffer.from(batchId),
      ],
      program.programId
    );

    try {
      await program.methods
        .updateBatchStatus(batchId, { valid: {} })
        .accounts({
          batch: batchPda,
          manufacturer: manufacturer.publicKey,
        } as any)
        .rpc();
      
      expect.fail("Should have thrown an error");
    } catch (err: any) {
      expect(err.toString()).to.include("BatchAlreadyRecalled");
      console.log("   Correctly rejected modification of recalled batch");
    }
  });

  it("Fails to register batch with unverified manufacturer", async () => {
    // Create a new wallet that's not registered
    const newManufacturer = anchor.web3.Keypair.generate();
    
    // Airdrop some SOL for transaction fees
    const airdropSig = await provider.connection.requestAirdrop(
      newManufacturer.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig);

    const [batchPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("batch"),
        newManufacturer.publicKey.toBuffer(),
        Buffer.from("BATCH002"),
      ],
      program.programId
    );

    const [registryPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("manufacturer"),
        newManufacturer.publicKey.toBuffer(),
      ],
      program.programId
    );

    try {
      await program.methods
        .registerBatch(
          "BATCH002",
          manufacturingDate,
          expiryDate,
          quantity,
          mrp,
          null
        )
        .accounts({
          batch: batchPda,
          registry: registryPda, // PDA will not exist because manufacturer is unregistered
          manufacturer: newManufacturer.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .signers([newManufacturer])
        .rpc();
      
      expect.fail("Should have thrown an error");
    } catch (err) {
      expect(err).to.not.be.null;
      console.log("   Correctly rejected unverified manufacturer (missing registry PDA)");
    }
  });

  it("Fails to register batch with zero quantity", async () => {
    const [batchPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("batch"),
        manufacturer.publicKey.toBuffer(),
        Buffer.from("BATCH_ZERO_QTY"),
      ],
      program.programId
    );

    const [registryPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("manufacturer"),
        manufacturer.publicKey.toBuffer(),
      ],
      program.programId
    );

    try {
      await program.methods
        .registerBatch(
          "BATCH_ZERO_QTY",
          manufacturingDate,
          expiryDate,
          new anchor.BN(0), // Zero quantity
          mrp,
          null
        )
        .accounts({
          batch: batchPda,
          registry: registryPda,
          manufacturer: manufacturer.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .rpc();
      
      expect.fail("Should have thrown an error");
    } catch (err: any) {
      expect(err.toString()).to.include("InvalidQuantity");
      console.log("   Correctly rejected zero quantity");
    }
  });

  it("Fails to register batch with zero MRP", async () => {
    const [batchPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("batch"),
        manufacturer.publicKey.toBuffer(),
        Buffer.from("BATCH_ZERO_MRP"),
      ],
      program.programId
    );

    const [registryPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("manufacturer"),
        manufacturer.publicKey.toBuffer(),
      ],
      program.programId
    );

    try {
      await program.methods
        .registerBatch(
          "BATCH_ZERO_MRP",
          manufacturingDate,
          expiryDate,
          quantity,
          new anchor.BN(0), // Zero MRP
          null
        )
        .accounts({
          batch: batchPda,
          registry: registryPda,
          manufacturer: manufacturer.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .rpc();
      
      expect.fail("Should have thrown an error");
    } catch (err: any) {
      expect(err.toString()).to.include("InvalidMrp");
      console.log("   Correctly rejected zero MRP");
    }
  });
});
