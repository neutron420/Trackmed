import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
export declare const SOLANA_RPC_URL: string;
export declare const PROGRAM_ID: PublicKey;
export declare const connection: Connection;
export declare function getProgram(wallet?: Keypair): anchor.Program<any>;
export declare function deriveBatchPDA(manufacturerWallet: PublicKey, batchHash: string): [PublicKey, number];
export declare function deriveManufacturerRegistryPDA(manufacturerWallet: PublicKey): [PublicKey, number];
//# sourceMappingURL=solana.d.ts.map