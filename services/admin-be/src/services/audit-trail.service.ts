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
 * For manufacturer users, only returns audit trails for their batches, shipments, etc.
 */
export async function getAuditTrails(
  page: number = 1,
  limit: number = 20,
  entityType?: EntityType,
  entityId?: string,
  manufacturerId?: string
) {
  const skip = (page - 1) * limit;
  const where: any = {};
  
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;

  // For manufacturer filtering, get their entity IDs
  if (manufacturerId) {
    // Get batch IDs belonging to this manufacturer
    const batches = await prisma.batch.findMany({
      where: { manufacturerId },
      select: { id: true },
    });
    const batchIds = batches.map(b => b.id);

    // Get shipment IDs for those batches
    const shipments = await prisma.shipment.findMany({
      where: { batchId: { in: batchIds } },
      select: { id: true },
    });
    const shipmentIds = shipments.map(s => s.id);

    // Get QR code IDs for those batches
    const qrCodes = await prisma.qRCode.findMany({
      where: { batchId: { in: batchIds } },
      select: { id: true },
    });
    const qrCodeIds = qrCodes.map(q => q.id);

    // Filter to only relevant entity IDs
    const allRelevantIds = [...batchIds, ...shipmentIds, ...qrCodeIds, manufacturerId];
    
    where.OR = [
      { entityId: { in: allRelevantIds } },
      { entityType: 'MANUFACTURER', entityId: manufacturerId },
      { 
        metadata: {
          path: ['manufacturerId'],
          equals: manufacturerId,
        }
      },
    ];
  }

  const [rawTrails, total] = await Promise.all([
    prisma.auditTrail.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditTrail.count({ where }),
  ]);

  // Fetch user names for performedBy IDs
  const userIds = [...new Set(rawTrails.map(t => t.performedBy).filter(Boolean))];
  const users = userIds.length > 0 
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      })
    : [];
  
  const userMap = new Map(users.map(u => [u.id, u.name || u.email || 'Unknown']));

  // Transform trails to include user-friendly fields
  const trails = rawTrails.map(trail => ({
    ...trail,
    // Frontend-friendly field names
    entity: trail.entityType,
    userName: userMap.get(trail.performedBy) || trail.performedBy || 'System',
    details: trail.metadata,
    ipAddress: (trail.metadata as any)?.ipAddress || null,
  }));

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
