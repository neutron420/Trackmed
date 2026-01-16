import { PublicKey } from "@solana/web3.js";

// Program ID
export const PROGRAM_ID = new PublicKey("48BYj4BVCp7D3EByu6f9nW8uHaFuuFdwJozB7iLZPxhJ");

// Re-export types
export * from "./types";

// IDL import helper
import idl from "../idl/solana_test_project.json";
export { idl };

// Batch Status enum for TypeScript usage
export enum BatchStatus {
  Valid = "valid",
  Suspended = "suspended",
  Recalled = "recalled",
}

// Helper type for batch status in Anchor format
export type BatchStatusAnchor = 
  | { valid: {} }
  | { suspended: {} }
  | { recalled: {} };

// Helper to convert BatchStatus to Anchor format
export function toAnchorStatus(status: BatchStatus): BatchStatusAnchor {
  switch (status) {
    case BatchStatus.Valid:
      return { valid: {} };
    case BatchStatus.Suspended:
      return { suspended: {} };
    case BatchStatus.Recalled:
      return { recalled: {} };
  }
}

// Helper to convert Anchor format to BatchStatus
export function fromAnchorStatus(status: BatchStatusAnchor): BatchStatus {
  if ("valid" in status) return BatchStatus.Valid;
  if ("suspended" in status) return BatchStatus.Suspended;
  if ("recalled" in status) return BatchStatus.Recalled;
  throw new Error("Unknown batch status");
}

// PDA derivation helpers
export function getManufacturerRegistryPda(
  manufacturerWallet: PublicKey,
  programId: PublicKey = PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("manufacturer"), manufacturerWallet.toBuffer()],
    programId
  );
}

export function getBatchPda(
  manufacturerWallet: PublicKey,
  batchHash: string,
  programId: PublicKey = PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("batch"), manufacturerWallet.toBuffer(), Buffer.from(batchHash)],
    programId
  );
}

// Type definitions for on-chain data
export interface BatchAccount {
  batchHash: string;
  manufacturerWallet: PublicKey;
  metadataHash: string | null;
  manufacturingDate: bigint;
  expiryDate: bigint;
  quantity: bigint;
  mrp: bigint;
  status: BatchStatusAnchor;
  createdAt: bigint;
  updatedAt: bigint;
  bump: number;
}

export interface ManufacturerRegistryAccount {
  manufacturer: PublicKey;
  isVerified: boolean;
  registeredAt: bigint;
  bump: number;
}

// Error codes mapping
export const ErrorCodes = {
  EmptyBatchId: 6000,
  BatchIdTooLong: 6001,
  MetadataHashTooLong: 6002,
  InvalidDateRange: 6003,
  ExpiredMedicine: 6004,
  InvalidQuantity: 6005,
  InvalidMrp: 6006,
  UnauthorizedManufacturer: 6007,
  InvalidBatchStatus: 6008,
  ManufacturerNotVerified: 6009,
  BatchAlreadyRecalled: 6010,
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
