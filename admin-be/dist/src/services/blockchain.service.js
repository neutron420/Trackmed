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
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyBatchOnBlockchain = verifyBatchOnBlockchain;
exports.isBatchValid = isBatchValid;
exports.isBatchExpired = isBatchExpired;
exports.getBatchStatusString = getBatchStatusString;
const web3_js_1 = require("@solana/web3.js");
const solana_1 = require("../config/solana");
const anchor = __importStar(require("@coral-xyz/anchor"));
const anchor_1 = require("@coral-xyz/anchor");
const solana_test_project_1 = require("../idl/solana_test_project");
async function verifyBatchOnBlockchain(batchHash, manufacturerWallet) {
    try {
        const manufacturerPubkey = new web3_js_1.PublicKey(manufacturerWallet);
        const [batchPDA] = (0, solana_1.deriveBatchPDA)(manufacturerPubkey, batchHash);
        // Fetch account data
        const accountInfo = await solana_1.connection.getAccountInfo(batchPDA);
        if (!accountInfo) {
            return { exists: false, error: 'Batch not found on blockchain' };
        }
        const provider = new anchor.AnchorProvider(solana_1.connection, {}, {
            commitment: 'confirmed',
        });
        const program = new anchor_1.Program(solana_test_project_1.IDL, solana_1.PROGRAM_ID, provider);
        const accounts = program.account;
        const batchAccount = await accounts.batch.fetch(batchPDA);
        const batchData = {
            batchHash: batchAccount.batchHash,
            manufacturerWallet: batchAccount.manufacturerWallet,
            manufacturingDate: batchAccount.manufacturingDate,
            expiryDate: batchAccount.expiryDate,
            status: batchAccount.status,
            createdAt: batchAccount.createdAt,
        };
        return {
            exists: true,
            data: batchData,
            pda: batchPDA.toBase58(),
        };
    }
    catch (error) {
        return {
            exists: false,
            error: error.message || 'Failed to verify bathc on blockchain',
        };
    }
}
function isBatchValid(status) {
    return 'valid' in status;
}
/**
 * Check if batch is expired based on blockchain expiry date
 */
function isBatchExpired(expiryDate) {
    const currentTimestamp = new anchor.BN(Math.floor(Date.now() / 1000));
    return expiryDate.lt(currentTimestamp);
}
/**
 * Get batch status string from blockchain status enum
 */
function getBatchStatusString(status) {
    return 'valid' in status ? 'Valid' : 'Recalled';
}
//# sourceMappingURL=blockchain.service.js.map