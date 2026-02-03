import { Connection, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { IDL } from "../idl/solana_test_project";

// Solana connection configuration
// Default to devnet, use SOLANA_RPC_URL env var to override
export const SOLANA_RPC_URL =
  process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
export const PROGRAM_ID = new PublicKey(
  "48BYj4BVCp7D3EByu6f9nW8uHaFuuFdwJozB7iLZPxhJ",
);

export const connection = new Connection(SOLANA_RPC_URL, "confirmed");

// Get read-only Anchor program instance (no wallet needed for reading)
export function getReadOnlyProgram(): anchor.Program<any> {
  // For read-only operations, we don't need a real wallet
  const dummyWallet = {
    publicKey: PublicKey.default,
    signTransaction: async () => {
      throw new Error("Read-only");
    },
    signAllTransactions: async () => {
      throw new Error("Read-only");
    },
  };

  const provider = new anchor.AnchorProvider(connection, dummyWallet as any, {
    commitment: "confirmed",
  });

  return new (Program as any)(IDL as any, PROGRAM_ID, provider);
}

// Derive PDA for batch account
// Seeds: ['batch', manufacturer_wallet, batch_hash]
export function deriveBatchPDA(
  manufacturerWallet: PublicKey,
  batchHash: string,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("batch"),
      manufacturerWallet.toBuffer(),
      Buffer.from(batchHash),
    ],
    PROGRAM_ID,
  );
}

// Derive PDA for manufacturer registry
export function deriveManufacturerRegistryPDA(
  manufacturerWallet: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("manufacturer"), manufacturerWallet.toBuffer()],
    PROGRAM_ID,
  );
}

// Blockchain batch data interface (matches on-chain Batch struct)
export interface BlockchainBatchData {
  batchHash: string;
  manufacturerWallet: PublicKey;
  metadataHash: string | null;
  manufacturingDate: bigint; // Unix timestamp
  expiryDate: bigint; // Unix timestamp
  quantity: bigint;
  mrp: bigint;
  status: { valid?: {} } | { suspended?: {} } | { recalled?: {} };
  createdAt: bigint;
  updatedAt: bigint;
  bump: number;
}

// Parse batch status from blockchain enum
export function parseBatchStatus(
  status: any,
): "VALID" | "SUSPENDED" | "RECALLED" {
  if (status.valid !== undefined) return "VALID";
  if (status.suspended !== undefined) return "SUSPENDED";
  if (status.recalled !== undefined) return "RECALLED";
  return "VALID"; // Default fallback
}

/**
 * Fetch batch data from blockchain
 * Returns null if batch doesn't exist on chain
 */
export async function fetchBatchFromBlockchain(
  manufacturerWallet: PublicKey,
  batchHash: string,
): Promise<BlockchainBatchData | null> {
  try {
    const [batchPDA] = deriveBatchPDA(manufacturerWallet, batchHash);
    const program = getReadOnlyProgram();

    // Fetch the account data
    const batchAccount = await (program.account as any).batch.fetch(batchPDA);

    if (!batchAccount) {
      return null;
    }

    return batchAccount as BlockchainBatchData;
  } catch (error: any) {
    // Account not found or other error
    console.error("[Blockchain] Failed to fetch batch:", error.message);
    return null;
  }
}
