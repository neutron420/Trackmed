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
exports.connection = exports.PROGRAM_ID = exports.SOLANA_RPC_URL = void 0;
exports.getProgram = getProgram;
exports.deriveBatchPDA = deriveBatchPDA;
exports.deriveManufacturerRegistryPDA = deriveManufacturerRegistryPDA;
const web3_js_1 = require("@solana/web3.js");
const anchor = __importStar(require("@coral-xyz/anchor"));
const anchor_1 = require("@coral-xyz/anchor");
const solana_test_project_1 = require("../idl/solana_test_project");
// Solana connection configuration
// Default to localnet for development
exports.SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'http://127.0.0.1:8899';
exports.PROGRAM_ID = new web3_js_1.PublicKey('48BYj4BVCp7D3EByu6f9nW8uHaFuuFdwJozB7iLZPxhJ');
exports.connection = new web3_js_1.Connection(exports.SOLANA_RPC_URL, 'confirmed');
// Get Anchor program instance
function getProgram(wallet) {
    const walletObj = wallet ? new anchor.Wallet(wallet) : {};
    const provider = new anchor.AnchorProvider(exports.connection, walletObj, { commitment: 'confirmed' });
    // Program constructor: Program(idl, programId, provider)
    // Using type assertion to work around Anchor type issues
    return new anchor_1.Program(solana_test_project_1.IDL, exports.PROGRAM_ID, provider);
}
// Derive PDA for batch account
function deriveBatchPDA(manufacturerWallet, batchHash) {
    return web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from('batch'),
        manufacturerWallet.toBuffer(),
        Buffer.from(batchHash),
    ], exports.PROGRAM_ID);
}
// Derive PDA for manufacturer registry
function deriveManufacturerRegistryPDA(manufacturerWallet) {
    return web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('manufacturer'), manufacturerWallet.toBuffer()], exports.PROGRAM_ID);
}
//# sourceMappingURL=solana.js.map