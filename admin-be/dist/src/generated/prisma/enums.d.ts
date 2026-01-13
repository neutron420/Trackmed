/**
* This file exports all enum related types from the schema.
*
* 🟢 You can import this file directly.
*/
export declare const UserRole: {
    readonly ADMIN: "ADMIN";
    readonly MANUFACTURER: "MANUFACTURER";
    readonly DISTRIBUTOR: "DISTRIBUTOR";
    readonly PHARMACY: "PHARMACY";
    readonly SCANNER: "SCANNER";
    readonly CONSUMER: "CONSUMER";
};
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export declare const BatchStatus: {
    readonly VALID: "VALID";
    readonly RECALLED: "RECALLED";
};
export type BatchStatus = (typeof BatchStatus)[keyof typeof BatchStatus];
export declare const LifecycleStatus: {
    readonly IN_PRODUCTION: "IN_PRODUCTION";
    readonly IN_TRANSIT: "IN_TRANSIT";
    readonly AT_DISTRIBUTOR: "AT_DISTRIBUTOR";
    readonly AT_PHARMACY: "AT_PHARMACY";
    readonly SOLD: "SOLD";
    readonly EXPIRED: "EXPIRED";
    readonly RECALLED: "RECALLED";
};
export type LifecycleStatus = (typeof LifecycleStatus)[keyof typeof LifecycleStatus];
export declare const ScanType: {
    readonly VERIFICATION: "VERIFICATION";
    readonly PURCHASE: "PURCHASE";
    readonly DISTRIBUTION: "DISTRIBUTION";
    readonly RECALL_CHECK: "RECALL_CHECK";
};
export type ScanType = (typeof ScanType)[keyof typeof ScanType];
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
export type FraudAlertType = (typeof FraudAlertType)[keyof typeof FraudAlertType];
export declare const FraudSeverity: {
    readonly LOW: "LOW";
    readonly MEDIUM: "MEDIUM";
    readonly HIGH: "HIGH";
    readonly CRITICAL: "CRITICAL";
};
export type FraudSeverity = (typeof FraudSeverity)[keyof typeof FraudSeverity];
//# sourceMappingURL=enums.d.ts.map