"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerBatch = registerBatch;
exports.updateBatchStatus = updateBatchStatus;
const database_1 = __importDefault(require("../config/database"));
const anchor = __importStar(require("@coral-xyz/anchor"));
const anchor_1 = require("@coral-xyz/anchor");
const solana_1 = require("../config/solana");
const solana_test_project_1 = require("../idl/solana_test_project");
/**
 * Register batch on blockchain
 * Returns transaction signature
 */
async function registerBatchOnBlockchain(manufacturerWallet, batchHash, manufacturingDate, expiryDate) {
    try {
        const wallet = new anchor.Wallet(manufacturerWallet);
        const provider = new anchor.AnchorProvider(solana_1.connection, wallet, {
            commitment: 'confirmed',
        });
        const program = new anchor_1.Program(solana_test_project_1.IDL, solana_1.PROGRAM_ID, provider);
        const manufacturingTimestamp = Math.floor(manufacturingDate.getTime() / 1000);
        const expiryTimestamp = Math.floor(expiryDate.getTime() / 1000);
        const [batchPDA] = (0, solana_1.deriveBatchPDA)(manufacturerWallet.publicKey, batchHash);
        const [registryPDA] = (0, solana_1.deriveManufacturerRegistryPDA)(manufacturerWallet.publicKey);
        // Call register_batch instruction
        const methods = program.methods;
        const tx = await methods
            .registerBatch(batchHash, new anchor.BN(manufacturingTimestamp), new anchor.BN(expiryTimestamp))
            .accounts({
            batch: batchPDA,
            registry: registryPDA,
            manufacturer: manufacturerWallet.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
        })
            .rpc();
        return {
            success: true,
            txHash: tx,
            pda: batchPDA.toBase58(),
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to register batch on blockchain',
        };
    }
}
/**
 * Register batch on both blockchain and database
 * This is the main registration function
 */
async function registerBatch(manufacturerWallet, data) {
    try {
        // Step 1: Get manufacturer from database
        const manufacturer = await database_1.default.manufacturer.findUnique({
            where: { id: data.manufacturerId },
        });
        if (!manufacturer) {
            return {
                success: false,
                error: 'Manufacturer not found',
            };
        }
        // Verify wallet address matches
        if (manufacturer.walletAddress !== manufacturerWallet.publicKey.toBase58()) {
            return {
                success: false,
                error: 'Manufacturer wallet address mismatch',
            };
        }
        // Step 2: Register on blockchain first
        const blockchainResult = await registerBatchOnBlockchain(manufacturerWallet, data.batchHash, data.manufacturingDate, data.expiryDate);
        if (!blockchainResult.success) {
            return {
                success: false,
                error: blockchainResult.error || 'Failed to register on blockchain',
            };
        }
        // Step 3: Store in database with proof fields + business details
        const batch = await database_1.default.batch.create({
            data: {
                // Proof fields (same as blockchain)
                batchHash: data.batchHash,
                manufacturingDate: data.manufacturingDate,
                expiryDate: data.expiryDate,
                status: 'VALID', // Default status
                createdAt: new Date(),
                // Blockchain transaction reference
                blockchainTxHash: blockchainResult.txHash,
                blockchainPda: blockchainResult.pda,
                // Business details (database only)
                batchNumber: data.batchNumber,
                manufacturerId: data.manufacturerId,
                medicineId: data.medicineId,
                quantity: data.quantity,
                remainingQuantity: data.quantity, // Initialize remaining quantity
                invoiceNumber: data.invoiceNumber,
                invoiceDate: data.invoiceDate,
                gstNumber: data.gstNumber,
                warehouseLocation: data.warehouseLocation,
                warehouseAddress: data.warehouseAddress,
                lifecycleStatus: 'IN_PRODUCTION',
            },
        });
        // Create audit trail (will be called from route with user context)
        const result = {
            success: true,
            batchId: batch.id,
        };
        if (blockchainResult.txHash) {
            result.blockchainTxHash = blockchainResult.txHash;
        }
        if (blockchainResult.pda) {
            result.blockchainPda = blockchainResult.pda;
        }
        return result;
    }
    catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to register batch',
        };
    }
}
/**
 * Update batch status on both blockchain and database
 */
async function updateBatchStatus(manufacturerWallet, batchHash, newStatus) {
    try {
        // Step 1: Get batch from database
        const batch = await database_1.default.batch.findUnique({
            where: { batchHash },
            include: { manufacturer: true },
        });
        if (!batch) {
            return {
                success: false,
                error: 'Batch not found',
            };
        }
        // Verify wallet address matches
        if (batch.manufacturer.walletAddress !== manufacturerWallet.publicKey.toBase58()) {
            return {
                success: false,
                error: 'Unauthorized: Wallet address mismatch',
            };
        }
        // Step 2: Update on blockchain
        const wallet = new anchor.Wallet(manufacturerWallet);
        const provider = new anchor.AnchorProvider(solana_1.connection, wallet, {
            commitment: 'confirmed',
        });
        const program = new anchor_1.Program(solana_test_project_1.IDL, solana_1.PROGRAM_ID, provider);
        const [batchPDA] = (0, solana_1.deriveBatchPDA)(manufacturerWallet.publicKey, batchHash);
        const statusEnum = newStatus === 'VALID'
            ? { valid: {} }
            : { recalled: {} };
        const methods = program.methods;
        const tx = await methods
            .updateBatchStatus(batchHash, statusEnum)
            .accounts({
            batch: batchPDA,
            manufacturer: manufacturerWallet.publicKey,
        })
            .rpc();
        // Step 3: Update in database
        const updatedBatch = await database_1.default.batch.update({
            where: { batchHash },
            data: {
                status: newStatus,
            },
        });
        // Create audit trail (will be called from route with user context)
        return {
            success: true,
            blockchainTxHash: tx,
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to update batch status',
        };
    }
}
//# sourceMappingURL=batch-registration.service.js.map