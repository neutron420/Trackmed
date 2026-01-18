import prisma from '../config/database';

export type EntityType = 'BATCH' | 'MANUFACTURER' | 'MEDICINE' | 'DISTRIBUTOR' | 'PHARMACY' | 'USER' | 'QR_CODE' | 'SHIPMENT' | 'REPORT';
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
export async function createAuditTrail(params: CreateAuditTrailParams) {
  return prisma.auditTrail.create({
    data: {
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      fieldName: params.fieldName,
      oldValue: params.oldValue,
      newValue: params.newValue,
      performedBy: params.performedBy,
      performedByRole: params.performedByRole,
      metadata: params.metadata || {},
    },
  });
}

/**
 * Get audit trail for an entity
 */
export async function getAuditTrail(entityType: EntityType, entityId: string) {
  return prisma.auditTrail.findMany({
    where: {
      entityType,
      entityId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Get audit trail with pagination
 */
export async function getAuditTrails(
  page: number = 1,
  limit: number = 20,
  entityType?: EntityType,
  entityId?: string
) {
  const skip = (page - 1) * limit;
  const where: any = {};
  
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;

  const [trails, total] = await Promise.all([
    prisma.auditTrail.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditTrail.count({ where }),
  ]);

  return {
    trails,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
