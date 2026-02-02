import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { PrismaClient } from "@prisma/client";
import { registerBatch, BatchRegistrationData } from "../src/services/batch-registration.service";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  // The private key provided by user (base58 encoded)
  const privateKeyBase58 = "4DHQ9RbjDtBMshTPk8sWZKE3HH8HA1QU2Mr9DxtqJej9mBAVv7QghMvkg9TubCCP8BQYg5zaAK6Fs9yUR5Lz9tbZ";
  
  // Decode the private key
  const privateKeyBytes = bs58.decode(privateKeyBase58);
  const manufacturerWallet = Keypair.fromSecretKey(privateKeyBytes);
  
  console.log("Manufacturer Wallet Public Key:", manufacturerWallet.publicKey.toBase58());
  
  // Get manufacturer from database
  const manufacturer = await prisma.manufacturer.findFirst({
    where: {
      walletAddress: manufacturerWallet.publicKey.toBase58()
    }
  });
  
  if (!manufacturer) {
    console.error("Manufacturer not found with wallet address:", manufacturerWallet.publicKey.toBase58());
    console.log("\nAvailable manufacturers:");
    const allManufacturers = await prisma.manufacturer.findMany({
      select: { id: true, name: true, walletAddress: true }
    });
    console.log(JSON.stringify(allManufacturers, null, 2));
    return;
  }
  
  console.log("Found manufacturer:", manufacturer.name, "(ID:", manufacturer.id + ")");
  
  // Get a medicine to use
  const medicine = await prisma.medicine.findFirst();
  
  if (!medicine) {
    console.error("No medicines found in database. Please create a medicine first.");
    return;
  }
  
  console.log("Using medicine:", medicine.name, medicine.strength);
  
  // Generate unique batch hash and batch number
  const timestamp = Date.now();
  const batchHash = crypto.createHash('sha256')
    .update(`${manufacturer.id}-${medicine.id}-${timestamp}`)
    .digest('hex')
    .substring(0, 32);
  
  const batchNumber = `BATCH-${timestamp}`;
  
  // Set dates
  const manufacturingDate = new Date();
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 2); // 2 years from now
  
  const batchData: BatchRegistrationData = {
    batchHash,
    manufacturingDate,
    expiryDate,
    batchNumber,
    manufacturerId: manufacturer.id,
    medicineId: medicine.id,
    quantity: 1000,
    invoiceNumber: `INV-${timestamp}`,
    invoiceDate: new Date(),
    gstNumber: "GST123456789",
    warehouseLocation: "Warehouse A",
    warehouseAddress: "123 Storage Street, Mumbai, India",
  };
  
  console.log("\nRegistering batch with data:");
  console.log("- Batch Hash:", batchHash);
  console.log("- Batch Number:", batchNumber);
  console.log("- Manufacturing Date:", manufacturingDate.toISOString());
  console.log("- Expiry Date:", expiryDate.toISOString());
  console.log("- Quantity:", batchData.quantity);
  console.log("- Medicine:", medicine.name);
  console.log("- Manufacturer:", manufacturer.name);
  
  console.log("\nSubmitting to blockchain and database...");
  
  const result = await registerBatch(manufacturerWallet, batchData);
  
  if (result.success) {
    console.log("\n✅ Batch registered successfully!");
    console.log("- Batch ID:", result.batchId);
    console.log("- Blockchain TX Hash:", result.blockchainTxHash || "N/A");
    console.log("- Blockchain PDA:", result.blockchainPda || "N/A");
  } else {
    console.error("\n❌ Failed to register batch:", result.error);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
