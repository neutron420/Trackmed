export type EntityType = 'BATCH' | 'MANUFACTURER' | 'MEDICINE' | 'DISTRIBUTOR' | 'PHARMACY' | 'USER' | 'QR_CODE';
export type ActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'LIFECYCLE_CHANGE' | 'QUANTITY_CHANGE';
export interface CreateAuditTrailParams {
    entityType: EntityType;
    entityId: string;
    action: ActionType;
    fieldName?: string;
    oldValue?: string;
    newValue?: string;
    performedBy: string;
    performedByRole?: string;
    metadata?: any;
}
/**
 * Create an audit trail entry
 */
export declare function createAuditTrail(params: CreateAuditTrailParams): Promise<{
    id: string;
    createdAt: Date;
    entityType: string;
    entityId: string;
    action: string;
    fieldName: string | null;
    oldValue: string | null;
    newValue: string | null;
    performedBy: string;
    performedByRole: string | null;
    metadata: import("@prisma/client/runtime/library").JsonValue | null;
}>;
/**
 * Get audit trail for an entity
 */
export declare function getAuditTrail(entityType: EntityType, entityId: string): Promise<{
    id: string;
    createdAt: Date;
    entityType: string;
    entityId: string;
    action: string;
    fieldName: string | null;
    oldValue: string | null;
    newValue: string | null;
    performedBy: string;
    performedByRole: string | null;
    metadata: import("@prisma/client/runtime/library").JsonValue | null;
}[]>;
/**
 * Get audit trail with pagination
 */
export declare function getAuditTrails(page?: number, limit?: number, entityType?: EntityType, entityId?: string): Promise<{
    trails: {
        id: string;
        createdAt: Date;
        entityType: string;
        entityId: string;
        action: string;
        fieldName: string | null;
        oldValue: string | null;
        newValue: string | null;
        performedBy: string;
        performedByRole: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
//# sourceMappingURL=audit-trail.service.d.ts.map