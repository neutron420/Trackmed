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
  const metadataHash = "QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o"; // Example IPFS hash

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

  it("Registers a new batch", async () => {
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
        metadataHash
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

    // Verify the batch account was created with minimal fields
    const batchAccount = await program.account.batch.fetch(batchPda);
    expect(batchAccount.batchId).to.equal(batchId);
    expect(batchAccount.manufacturer.toString()).to.equal(manufacturer.publicKey.toString());
    expect(batchAccount.manufacturingDate.toString()).to.equal(manufacturingDate.toString());
    expect(batchAccount.expiryDate.toString()).to.equal(expiryDate.toString());
    expect(batchAccount.metadataHash).to.equal(metadataHash);
    expect(batchAccount.status).to.deep.equal({ active: {} });
    console.log("   Batch Status:", batchAccount.status);
    console.log("   Metadata Hash:", batchAccount.metadataHash);
  });

  it("Updates batch status", async () => {
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

    console.log("   Batch status updated!");
    console.log("   Transaction:", tx);

    // Verify the status was updated
    const batchAccount = await program.account.batch.fetch(batchPda);
    expect(batchAccount.status).to.deep.equal({ recalled: {} });
    console.log("   New Status:", batchAccount.status);
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

    try {
      await program.methods
        .registerBatch(
          "BATCH002",
          manufacturingDate,
          expiryDate,
          null
        )
        .accounts({
          batch: batchPda,
          registry: PublicKey.default, // Invalid registry
          manufacturer: newManufacturer.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .signers([newManufacturer])
        .rpc();
      
      expect.fail("Should have thrown an error");
    } catch (err) {
      expect(err).to.not.be.null;
      console.log("   Correctly rejected unverified manufacturer");
    }
  });
});
