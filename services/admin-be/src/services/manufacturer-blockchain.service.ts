import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import {
  connection,
  deriveManufacturerRegistryPDA,
  PROGRAM_ID,
} from "../config/solana";

/**
 * Check if manufacturer registry exists on blockchain
 */
export async function checkManufacturerRegistryExists(
  manufacturerWallet: PublicKey
): Promise<boolean> {
  try {
    const [registryPDA] = deriveManufacturerRegistryPDA(manufacturerWallet);
    const accountInfo = await connection.getAccountInfo(registryPDA);
    return accountInfo !== null;
  } catch (error) {
    console.error("[Blockchain] Error checking manufacturer registry:", error);
    return false;
  }
}

/**
 * Register manufacturer on blockchain (creates their registry account)
 * This must be called once before the manufacturer can register batches
 */
export async function registerManufacturerOnBlockchain(
  manufacturerWallet: Keypair
): Promise<{
  success: boolean;
  txHash?: string;
  pda?: string;
  error?: string;
}> {
  try {
    // Check if already registered
    const exists = await checkManufacturerRegistryExists(
      manufacturerWallet.publicKey
    );
    if (exists) {
      const [registryPDA] = deriveManufacturerRegistryPDA(
        manufacturerWallet.publicKey
      );
      return {
        success: true,
        pda: registryPDA.toBase58(),
        txHash: "already-registered",
      };
    }

    const [registryPDA] = deriveManufacturerRegistryPDA(
      manufacturerWallet.publicKey
    );

    // Build instruction data manually
    // Discriminator for register_manufacturer from IDL: [209, 17, 71, 213, 190, 230, 125, 136]
    const discriminator = Buffer.from([209, 17, 71, 213, 190, 230, 125, 136]);

    const instruction = new Transaction().add({
      keys: [
        { pubkey: registryPDA, isSigner: false, isWritable: true },
        {
          pubkey: manufacturerWallet.publicKey,
          isSigner: true,
          isWritable: true,
        },
        {
          pubkey: anchor.web3.SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: PROGRAM_ID,
      data: discriminator,
    });

    instruction.feePayer = manufacturerWallet.publicKey;
    instruction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    instruction.sign(manufacturerWallet);

    const signature = await connection.sendRawTransaction(
      instruction.serialize()
    );
    await connection.confirmTransaction(signature, "confirmed");

    console.log(
      "[Blockchain] Manufacturer registered successfully:",
      signature
    );

    return {
      success: true,
      txHash: signature,
      pda: registryPDA.toBase58(),
    };
  } catch (error: any) {
    console.error("[Blockchain] registerManufacturerOnBlockchain failed:", {
      message: error?.message,
      stack: error?.stack,
    });
    return {
      success: false,
      error: error.message || "Failed to register manufacturer on blockchain",
    };
  }
}

/**
 * Ensure manufacturer is registered on blockchain before batch registration
 * Call this before any batch registration attempt
 */
export async function ensureManufacturerOnBlockchain(
  manufacturerWallet: Keypair
): Promise<{
  success: boolean;
  alreadyRegistered: boolean;
  txHash?: string;
  pda?: string;
  error?: string;
}> {
  const exists = await checkManufacturerRegistryExists(
    manufacturerWallet.publicKey
  );

  if (exists) {
    const [registryPDA] = deriveManufacturerRegistryPDA(
      manufacturerWallet.publicKey
    );
    return {
      success: true,
      alreadyRegistered: true,
      pda: registryPDA.toBase58(),
    };
  }

  const result = await registerManufacturerOnBlockchain(manufacturerWallet);
  return {
    ...result,
    alreadyRegistered: false,
  };
}
