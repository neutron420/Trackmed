/**
 * This file should be your main import to use Prisma. Through it you get access to all the models, enums, and input types.
 *
 * 🟢 You can import this file directly.
 */
import * as runtime from "@prisma/client/runtime/library";
import * as $Enums from "./enums";
import * as $Class from "./internal/class";
import * as Prisma from "./internal/prismaNamespace";
export * as $Enums from './enums';
/**
 * ## Prisma Client
 *
 * Type-safe database client for TypeScript
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export declare const PrismaClient: $Class.PrismaClientConstructor;
export type PrismaClient<LogOpts extends Prisma.LogLevel = never, OmitOpts extends Prisma.PrismaClientOptions["omit"] = Prisma.PrismaClientOptions["omit"], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = $Class.PrismaClient<LogOpts, OmitOpts, ExtArgs>;
export { Prisma };
/**
 * Model User
 *
 */
export type User = Prisma.UserModel;
/**
 * Model Manufacturer
 *
 */
export type Manufacturer = Prisma.ManufacturerModel;
/**
 * Model Medicine
 *
 */
export type Medicine = Prisma.MedicineModel;
/**
 * Model Batch
 *
 */
export type Batch = Prisma.BatchModel;
/**
 * Model QRCode
 *
 */
export type QRCode = Prisma.QRCodeModel;
/**
 * Model ScanLog
 *
 */
export type ScanLog = Prisma.ScanLogModel;
/**
 * Model FraudAlert
 *
 */
export type FraudAlert = Prisma.FraudAlertModel;
/**
 * Model Analytics
 *
 */
export type Analytics = Prisma.AnalyticsModel;
export type UserRole = $Enums.UserRole;
export declare const UserRole: {
    readonly ADMIN: "ADMIN";
    readonly MANUFACTURER: "MANUFACTURER";
    readonly DISTRIBUTOR: "DISTRIBUTOR";
    readonly PHARMACY: "PHARMACY";
    readonly SCANNER: "SCANNER";
    readonly CONSUMER: "CONSUMER";
};
export type BatchStatus = $Enums.BatchStatus;
export declare const BatchStatus: {
    readonly VALID: "VALID";
    readonly RECALLED: "RECALLED";
};
export type LifecycleStatus = $Enums.LifecycleStatus;
export declare const LifecycleStatus: {
    readonly IN_PRODUCTION: "IN_PRODUCTION";
    readonly IN_TRANSIT: "IN_TRANSIT";
    readonly AT_DISTRIBUTOR: "AT_DISTRIBUTOR";
    readonly AT_PHARMACY: "AT_PHARMACY";
    readonly SOLD: "SOLD";
    readonly EXPIRED: "EXPIRED";
    readonly RECALLED: "RECALLED";
};
export type ScanType = $Enums.ScanType;
export declare const ScanType: {
    readonly VERIFICATION: "VERIFICATION";
    readonly PURCHASE: "PURCHASE";
    readonly DISTRIBUTION: "DISTRIBUTION";
    readonly RECALL_CHECK: "RECALL_CHECK";
};
export type FraudAlertType = $Enums.FraudAlertType;
export declare const FraudAlertType: {
    readonly DUPLICATE_QR_CODE: "DUPLICATE_QR_CODE";
    readonly INVALID_BATCH_HASH: "INVALID_BATCH_HASH";
    readonly EXPIRED_MEDICINE: "EXPIRED_MEDICINE";
    readonly RECALLED_BATCH: "RECALLED_BATCH";
    readonly LOCATION_MISMATCH: "LOCATION_MISMATCH";
    readonly FREQUENT_SCANS: "FREQUENT_SCANS";
    readonly UNAUTHORIZED_ACCESS: "UNAUTHORIZED_ACCESS";
    readonly BLOCKCHAIN_MISMATCH: "BLOCKCHAIN_MISMATCH";
};
export type FraudSeverity = $Enums.FraudSeverity;
export declare const FraudSeverity: {
    readonly LOW: "LOW";
    readonly MEDIUM: "MEDIUM";
    readonly HIGH: "HIGH";
    readonly CRITICAL: "CRITICAL";
};
//# sourceMappingURL=client.d.ts.map