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
  const batchId = "BATCH001";
  const medicineName = "Paracetamol";
  const manufacturingDate = new anchor.BN(Math.floor(Date.now() / 1000) - 86400 * 30); // 30 days ago
  const expiryDate = new anchor.BN(Math.floor(Date.now() / 1000) + 86400 * 365); // 1 year from now

  it("Registers a new batch", async () => {
    const [batchPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("batch"),
        manufacturer.publicKey.toBuffer(),
        Buffer.from(batchId),
      ],
      program.programId
    );

    const tx = await (program.methods as any)
      .registerBatch(
        batchId,
        medicineName,
        manufacturingDate,
        expiryDate
      )
      .accounts({
        batch: batchPda,
        manufacturer: manufacturer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("   Batch registered!");
    console.log("   Batch PDA:", batchPda.toString());
    console.log("   Transaction:", tx);

    // Verify the batch account was created
    const batchAccount = await (program.account as any).batch.fetch(batchPda);
    expect(batchAccount.batchId).to.equal(batchId);
    expect(batchAccount.medicineName).to.equal(medicineName);
    console.log("   Batch Status:", batchAccount.status);
  });

  it("Verifies a batch", async () => {
    const [batchPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("batch"),
        manufacturer.publicKey.toBuffer(),
        Buffer.from(batchId),
      ],
      program.programId
    );

    const tx = await (program.methods as any)
      .verifyBatch(batchId)
      .accounts({
        batch: batchPda,
        manufacturer: manufacturer.publicKey,
      })
      .rpc();

    console.log("   Batch verified!");
    console.log("   Transaction:", tx);
  });
});
