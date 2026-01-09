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
  const brandName = "Crocin";
  const genericName = "Paracetamol";
  const manufacturingDate = new anchor.BN(Math.floor(Date.now() / 1000) - 86400 * 30); // 30 days ago
  const expiryDate = new anchor.BN(Math.floor(Date.now() / 1000) + 86400 * 365); // 1 year from now
  const mrp = new anchor.BN(5000); // 50.00 in paise (assuming smallest unit)
  const quantityReceived = 100;
  const dosageForm = { tablet: {} };
  const strength = "500 mg";
  const composition = "Paracetamol 500mg";
  const manufacturerName = "GlaxoSmithKline Pharmaceuticals Ltd";
  const manufacturerLicense = "MH/DRUGS/W-1234";
  const manufacturerAddress = "Dr. Annie Besant Road, Worli, Mumbai - 400030, Maharashtra, India";
  const storageCondition = { normal: {} };
  const physicalCondition = { good: {} };
  const invoiceNumber = "INV-2024-001";
  const invoiceDate = new anchor.BN(Math.floor(Date.now() / 1000));
  const gstNumber = "27AABCU9603R1ZX";

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
        brandName,
        genericName,
        batchId,
        manufacturingDate,
        expiryDate,
        mrp,
        quantityReceived,
        dosageForm,
        strength,
        composition,
        manufacturerName,
        manufacturerLicense,
        manufacturerAddress,
        storageCondition,
        physicalCondition,
        invoiceNumber,
        invoiceDate,
        gstNumber
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

    // Verify the batch account was created with all fields
    const batchAccount = await (program.account as any).batch.fetch(batchPda);
    expect(batchAccount.batchId).to.equal(batchId);
    expect(batchAccount.brandName).to.equal(brandName);
    expect(batchAccount.genericName).to.equal(genericName);
    expect(batchAccount.mrp.toString()).to.equal(mrp.toString());
    expect(batchAccount.quantityReceived).to.equal(quantityReceived);
    expect(batchAccount.strength).to.equal(strength);
    expect(batchAccount.composition).to.equal(composition);
    expect(batchAccount.manufacturerName).to.equal(manufacturerName);
    expect(batchAccount.manufacturerLicense).to.equal(manufacturerLicense);
    expect(batchAccount.manufacturerAddress).to.equal(manufacturerAddress);
    expect(batchAccount.invoiceNumber).to.equal(invoiceNumber);
    expect(batchAccount.gstNumber).to.equal(gstNumber);
    console.log("   Batch Status:", batchAccount.status);
    console.log("   Dosage Form:", batchAccount.dosageForm);
    console.log("   Storage Condition:", batchAccount.storageCondition);
    console.log("   Physical Condition:", batchAccount.physicalCondition);
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
