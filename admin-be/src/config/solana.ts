import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { IDL } from '../idl/solana_test_project';

// Solana connection configuration
// Default to localnet for development
export const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'http://127.0.0.1:8899';
export const PROGRAM_ID = new PublicKey('48BYj4BVCp7D3EByu6f9nW8uHaFuuFdwJozB7iLZPxhJ');

export const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Get Anchor program instance
export function getProgram(wallet?: Keypair): anchor.Program<any> {
  const walletObj = wallet ? new anchor.Wallet(wallet) : ({} as anchor.Wallet);
  const provider = new anchor.AnchorProvider(
    connection,
    walletObj,
    { commitment: 'confirmed' }
  );
  
  // Program constructor: Program(idl, programId, provider)
  // Using type assertion to work around Anchor type issues
  return new (Program as any)(IDL as any, PROGRAM_ID, provider);
}

// Derive PDA for batch account
export function deriveBatchPDA(
  manufacturerWallet: PublicKey,
  batchHash: string
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('batch'),
      manufacturerWallet.toBuffer(),
      Buffer.from(batchHash),
    ],
    PROGRAM_ID
  );
}

// Derive PDA for manufacturer registry
export function deriveManufacturerRegistryPDA(
  manufacturerWallet: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('manufacturer'), manufacturerWallet.toBuffer()],
    PROGRAM_ID
  );
}
