# @trackmed/idl

TrackMed Solana Program IDL and TypeScript types package.

## Installation

```bash
npm install @trackmed/idl
# or
yarn add @trackmed/idl
```

## Usage

```typescript
import { 
  PROGRAM_ID, 
  idl, 
  BatchStatus, 
  getBatchPda, 
  getManufacturerRegistryPda,
  toAnchorStatus,
  fromAnchorStatus,
  ErrorCodes
} from "@trackmed/idl";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { SolanaTestProject } from "@trackmed/idl/types";

// Initialize program
const provider = AnchorProvider.env();
const program = new Program<SolanaTestProject>(idl as any, provider);

// Get PDAs
const manufacturerWallet = provider.wallet.publicKey;
const [registryPda] = getManufacturerRegistryPda(manufacturerWallet);
const [batchPda] = getBatchPda(manufacturerWallet, "BATCH001");

// Register a batch
await program.methods
  .registerBatch(
    "BATCH001",
    new BN(manufacturingDate),
    new BN(expiryDate),
    new BN(1000),  // quantity
    new BN(50000), // MRP in smallest unit
    "QmIPFSHash..." // optional metadata hash
  )
  .accounts({
    batch: batchPda,
    registry: registryPda,
    manufacturer: manufacturerWallet,
    systemProgram: SystemProgram.programId,
  })
  .rpc();

// Update batch status
await program.methods
  .updateBatchStatus("BATCH001", toAnchorStatus(BatchStatus.Suspended))
  .accounts({
    batch: batchPda,
    manufacturer: manufacturerWallet,
  })
  .rpc();

// Fetch and parse batch
const batchAccount = await program.account.batch.fetch(batchPda);
const status = fromAnchorStatus(batchAccount.status);
console.log("Batch status:", status); // "valid" | "suspended" | "recalled"
```

## Exported Items

### Constants
- `PROGRAM_ID` - The deployed program ID
- `idl` - The program IDL JSON
- `ErrorCodes` - Mapping of error names to codes

### Enums
- `BatchStatus` - TypeScript enum for batch status (Valid, Suspended, Recalled)

### Types
- `SolanaTestProject` - Program type for Anchor
- `BatchAccount` - Batch account data type
- `ManufacturerRegistryAccount` - Manufacturer registry data type
- `BatchStatusAnchor` - Anchor-compatible status type

### Helpers
- `getManufacturerRegistryPda(wallet, programId?)` - Derive manufacturer registry PDA
- `getBatchPda(wallet, batchHash, programId?)` - Derive batch PDA
- `toAnchorStatus(status)` - Convert BatchStatus enum to Anchor format
- `fromAnchorStatus(status)` - Convert Anchor format to BatchStatus enum

## Syncing with Program

After rebuilding the Solana program, run:

```bash
npm run sync
npm run build
```

This copies the latest IDL and types from `target/` to this package.
