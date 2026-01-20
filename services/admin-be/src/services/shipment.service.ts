import prisma from '../config/database';
import { createAuditTrail } from './audit-trail.service';
import { sendManufacturerOperation } from './notification.service';

// Define ShipmentStatus locally (matches Prisma schema)
export type ShipmentStatus = 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';

// Generate unique shipment number
function generateShipmentNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SHP-${year}${month}-${random}`;
}

// Create a new shipment
export async function createShipment(data: {
  batchId: string;
  distributorId: string;
  quantity: number;
  pickupAddress?: string;
  deliveryAddress?: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: Date;
  notes?: string;
  createdBy: string;
}) {
  try {
    // Verify batch exists and has enough quantity
    const batch = await prisma.batch.findUnique({
      where: { id: data.batchId },
      include: { medicine: true, manufacturer: true },
    });

    if (!batch) {
      return { success: false, error: 'Batch not found' };
    }

    if (batch.remainingQuantity < data.quantity) {
      return {
        success: false,
        error: `Insufficient quantity. Available: ${batch.remainingQuantity}`,
      };
    }

    // Verify distributor exists
    const distributor = await prisma.distributor.findUnique({
      where: { id: data.distributorId },
    });

    if (!distributor) {
      return { success: false, error: 'Distributor not found' };
    }

    // Create shipment
    const shipment = await prisma.shipment.create({
      data: {
        shipmentNumber: generateShipmentNumber(),
        batchId: data.batchId,
        distributorId: data.distributorId,
        quantity: data.quantity,
        pickupAddress: data.pickupAddress,
        deliveryAddress: data.deliveryAddress || distributor.address,
        trackingNumber: data.trackingNumber,
        carrier: data.carrier,
        estimatedDelivery: data.estimatedDelivery,
        notes: data.notes,
        createdBy: data.createdBy,
        trackingHistory: {
          create: {
            status: 'PENDING',
            description: 'Shipment created and awaiting pickup',
          },
        },
      },
      include: {
        batch: {
          include: { medicine: true, manufacturer: true },
        },
        distributor: true,
        trackingHistory: true,
      },
    });

    // Update batch remaining quantity
    await prisma.batch.update({
      where: { id: data.batchId },
      data: {
        remainingQuantity: batch.remainingQuantity - data.quantity,
      },
    });

    // Create audit trail
    await createAuditTrail({
      entityType: 'SHIPMENT',
      entityId: shipment.id,
      action: 'CREATE',
      performedBy: data.createdBy,
      metadata: {
        shipmentNumber: shipment.shipmentNumber,
        batchNumber: batch.batchNumber,
        quantity: data.quantity,
      },
    });

    // Send notification to admins about shipment creation
    try {
      await sendManufacturerOperation(
        'Created Shipment',
        `Shipment ${shipment.shipmentNumber} created for batch ${batch.batchNumber} (${batch.medicine.name}) - Quantity: ${data.quantity} to ${distributor.name}`,
        batch.id,
        batch.batchNumber,
        batch.manufacturer.name,
        'INFO'
      );
    } catch (notifyErr) {
      console.error('Failed to send admin notification for shipment creation:', notifyErr);
    }

    return { success: true, shipment };
  } catch (error: any) {
    console.error('Error creating shipment:', error);
    return { success: false, error: error.message };
  }
}

// Get all shipments with filters
export async function getShipments(filters?: {
  status?: ShipmentStatus;
  distributorId?: string;
  batchId?: string;
  manufacturerId?: string; // NEW: Filter by manufacturer
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.distributorId) {
      where.distributorId = filters.distributorId;
    }

    if (filters?.batchId) {
      where.batchId = filters.batchId;
    }

    // Filter by manufacturer - shipments from manufacturer's batches
    if (filters?.manufacturerId) {
      where.batch = {
        manufacturerId: filters.manufacturerId,
      };
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    if (filters?.search) {
      where.OR = [
        { shipmentNumber: { contains: filters.search, mode: 'insensitive' } },
        { trackingNumber: { contains: filters.search, mode: 'insensitive' } },
        { batch: { batchNumber: { contains: filters.search, mode: 'insensitive' } } },
        { distributor: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        include: {
          batch: {
            include: { medicine: true, manufacturer: true },
          },
          distributor: true,
          trackingHistory: {
            orderBy: { timestamp: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.shipment.count({ where }),
    ]);

    return {
      success: true,
      data: shipments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    console.error('Error getting shipments:', error);
    return { success: false, error: error.message };
  }
}

// Get shipment by ID
export async function getShipmentById(id: string) {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: {
        batch: {
          include: { medicine: true, manufacturer: true },
        },
        distributor: true,
        trackingHistory: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!shipment) {
      return { success: false, error: 'Shipment not found' };
    }

    return { success: true, shipment };
  } catch (error: any) {
    console.error('Error getting shipment:', error);
    return { success: false, error: error.message };
  }
}

// Update shipment status
export async function updateShipmentStatus(
  id: string,
  status: ShipmentStatus,
  data: {
    location?: string;
    description?: string;
    updatedBy: string;
  }
) {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: { batch: true },
    });

    if (!shipment) {
      return { success: false, error: 'Shipment not found' };
    }

    // Update shipment status
    const updateData: any = { status };

    if (status === 'PICKED_UP' || status === 'IN_TRANSIT') {
      updateData.shippedAt = shipment.shippedAt || new Date();
    }

    if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    const updatedShipment = await prisma.shipment.update({
      where: { id },
      data: {
        ...updateData,
        trackingHistory: {
          create: {
            status,
            location: data.location,
            description: data.description || getStatusDescription(status),
          },
        },
      },
      include: {
        batch: {
          include: { medicine: true, manufacturer: true },
        },
        distributor: true,
        trackingHistory: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    // If delivered, update batch lifecycle
    if (status === 'DELIVERED') {
      await prisma.batch.update({
        where: { id: shipment.batchId },
        data: {
          lifecycleStatus: 'AT_DISTRIBUTOR',
          distributorId: shipment.distributorId,
        },
      });
    }

    // Create audit trail
    await createAuditTrail({
      entityType: 'SHIPMENT',
      entityId: id,
      action: 'STATUS_CHANGE',
      fieldName: 'status',
      oldValue: shipment.status,
      newValue: status,
      performedBy: data.updatedBy,
    });

    return { success: true, shipment: updatedShipment };
  } catch (error: any) {
    console.error('Error updating shipment status:', error);
    return { success: false, error: error.message };
  }
}

// Cancel shipment
export async function cancelShipment(id: string, reason: string, cancelledBy: string) {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: { batch: true },
    });

    if (!shipment) {
      return { success: false, error: 'Shipment not found' };
    }

    if (shipment.status === 'DELIVERED') {
      return { success: false, error: 'Cannot cancel a delivered shipment' };
    }

    if (shipment.status === 'CANCELLED') {
      return { success: false, error: 'Shipment is already cancelled' };
    }

    // Cancel shipment
    const updatedShipment = await prisma.shipment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: reason,
        trackingHistory: {
          create: {
            status: 'CANCELLED',
            description: `Shipment cancelled: ${reason}`,
          },
        },
      },
      include: {
        batch: {
          include: { medicine: true, manufacturer: true },
        },
        distributor: true,
        trackingHistory: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    // Restore batch quantity
    await prisma.batch.update({
      where: { id: shipment.batchId },
      data: {
        remainingQuantity: shipment.batch.remainingQuantity + shipment.quantity,
      },
    });

    // Create audit trail
    await createAuditTrail({
      entityType: 'SHIPMENT',
      entityId: id,
      action: 'STATUS_CHANGE',
      fieldName: 'status',
      oldValue: shipment.status,
      newValue: 'CANCELLED',
      performedBy: cancelledBy,
      metadata: { reason },
    });

    return { success: true, shipment: updatedShipment };
  } catch (error: any) {
    console.error('Error cancelling shipment:', error);
    return { success: false, error: error.message };
  }
}

// Get shipment statistics
export async function getShipmentStats(manufacturerId?: string) {
  try {
    // Build where clause for manufacturer filtering
    const baseWhere: any = manufacturerId ? { batch: { manufacturerId } } : {};
    
    const [total, pending, inTransit, delivered, cancelled] = await Promise.all([
      prisma.shipment.count({ where: baseWhere }),
      prisma.shipment.count({ where: { ...baseWhere, status: 'PENDING' } }),
      prisma.shipment.count({
        where: { ...baseWhere, status: { in: ['IN_TRANSIT', 'PICKED_UP', 'OUT_FOR_DELIVERY'] } },
      }),
      prisma.shipment.count({ where: { ...baseWhere, status: 'DELIVERED' } }),
      prisma.shipment.count({ where: { ...baseWhere, status: 'CANCELLED' } }),
    ]);

    // Get recent shipments
    const recentShipments = await prisma.shipment.findMany({
      where: baseWhere,
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        batch: { include: { medicine: true } },
        distributor: true,
      },
    });

    return {
      success: true,
      data: {
        total,
        pending,
        inTransit,
        delivered,
        cancelled,
        deliveryRate: total > 0 ? ((delivered / total) * 100).toFixed(1) : '0',
        recentShipments,
      },
    };
  } catch (error: any) {
    console.error('Error getting shipment stats:', error);
    return { success: false, error: error.message };
  }
}

// Helper function for status descriptions
function getStatusDescription(status: ShipmentStatus): string {
  const descriptions: Record<ShipmentStatus, string> = {
    PENDING: 'Shipment created and awaiting pickup',
    PICKED_UP: 'Package has been picked up from warehouse',
    IN_TRANSIT: 'Package is in transit to destination',
    OUT_FOR_DELIVERY: 'Package is out for delivery',
    DELIVERED: 'Package has been delivered successfully',
    CANCELLED: 'Shipment has been cancelled',
    RETURNED: 'Package has been returned to sender',
  };
  return descriptions[status] || 'Status update';
}
