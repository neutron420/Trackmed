import prisma from '../config/database';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

interface ServiceResult {
  success: boolean;
  error?: string;
  data?: any;
}

interface CreateOrderInput {
  addressId: string;
  notes?: string;
  prescriptionUrl?: string;
}

/**
 * Generate unique order number
 */
const generateOrderNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = uuidv4().slice(0, 6).toUpperCase();
  return `TM${year}${month}${day}${random}`;
};

/**
 * Create order from cart
 */
export const createOrder = async (
  userId: string,
  input: CreateOrderInput
): Promise<ServiceResult> => {
  try {
    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: input.addressId, userId },
    });

    if (!address) {
      return {
        success: false,
        error: 'Invalid address',
      };
    }

    // Get cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            batch: {
              include: {
                medicine: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        error: 'Cart is empty',
      };
    }

    // Validate all items are available
    const unavailableItems: string[] = [];
    for (const item of cart.items) {
      if (
        item.batch.status !== 'VALID' ||
        new Date() > item.batch.expiryDate ||
        item.batch.remainingQuantity < item.quantity
      ) {
        unavailableItems.push(item.batch.medicine.name);
      }
    }

    if (unavailableItems.length > 0) {
      return {
        success: false,
        error: `Some items are unavailable: ${unavailableItems.join(', ')}`,
      };
    }

    // Calculate totals
    let subtotal = new Decimal(0);
    const orderItems = cart.items.map((item: any) => {
      const unitPrice = item.batch.medicine.mrp;
      const totalPrice = unitPrice.mul(item.quantity);
      subtotal = subtotal.add(totalPrice);

      return {
        batchId: item.batchId,
        medicineName: item.batch.medicine.name,
        medicineStrength: item.batch.medicine.strength,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      };
    });

    const tax = subtotal.mul(0.18); // 18% GST
    const deliveryFee = subtotal.greaterThan(500) ? new Decimal(0) : new Decimal(40); // Free delivery above 500
    const total = subtotal.add(tax).add(deliveryFee);

    // Create order with transaction
    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          addressId: input.addressId,
          subtotal,
          tax,
          deliveryFee,
          total,
          notes: input.notes,
          prescriptionUrl: input.prescriptionUrl,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
          address: true,
        },
      });

      // Update batch quantities
      for (const item of cart.items) {
        await tx.batch.update({
          where: { id: item.batchId },
          data: {
            remainingQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    // Calculate estimated delivery (3-5 days)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 4);

    return {
      success: true,
      data: {
        ...order,
        estimatedDelivery,
      },
    };
  } catch (error: any) {
    console.error('Create order error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create order',
    };
  }
};

/**
 * Get user's orders
 */
export const getOrders = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
  status?: string
): Promise<ServiceResult> => {
  try {
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              batch: {
                include: {
                  medicine: {
                    select: {
                      imageUrl: true,
                    },
                  },
                },
              },
            },
          },
          address: {
            select: {
              city: true,
              state: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error: any) {
    console.error('Get orders error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get orders',
    };
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (
  userId: string,
  orderId: string
): Promise<ServiceResult> => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        items: {
          include: {
            batch: {
              include: {
                medicine: true,
                manufacturer: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        address: true,
      },
    });

    if (!order) {
      return {
        success: false,
        error: 'Order not found',
      };
    }

    return {
      success: true,
      data: order,
    };
  } catch (error: any) {
    console.error('Get order error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get order',
    };
  }
};

/**
 * Cancel order
 */
export const cancelOrder = async (
  userId: string,
  orderId: string,
  reason?: string
): Promise<ServiceResult> => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });

    if (!order) {
      return {
        success: false,
        error: 'Order not found',
      };
    }

    // Only pending or confirmed orders can be cancelled
    if (!['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status)) {
      return {
        success: false,
        error: 'Order cannot be cancelled at this stage',
      };
    }

    // Cancel order and restore inventory
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancellationReason: reason,
          paymentStatus: order.paymentStatus === 'PAID' ? 'REFUNDED' : 'FAILED',
        },
      });

      // Restore batch quantities
      for (const item of order.items) {
        await tx.batch.update({
          where: { id: item.batchId },
          data: {
            remainingQuantity: {
              increment: item.quantity,
            },
          },
        });
      }
    });

    return {
      success: true,
      data: { message: 'Order cancelled successfully' },
    };
  } catch (error: any) {
    console.error('Cancel order error:', error);
    return {
      success: false,
      error: error.message || 'Failed to cancel order',
    };
  }
};

/**
 * Initiate payment for order
 */
export const initiatePayment = async (
  userId: string,
  orderId: string,
  paymentMethod: string
): Promise<ServiceResult> => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
    });

    if (!order) {
      return {
        success: false,
        error: 'Order not found',
      };
    }

    if (order.paymentStatus !== 'PENDING') {
      return {
        success: false,
        error: 'Payment already processed',
      };
    }

    // In real implementation, integrate with Razorpay here
    // For now, return mock payment data

    const paymentId = `pay_${uuidv4().slice(0, 14)}`;

    // Update order with payment method
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentMethod,
        paymentId,
      },
    });

    return {
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.total,
        currency: 'INR',
        paymentId,
        // In real implementation, return Razorpay order details
        razorpayOrderId: `order_${uuidv4().slice(0, 14)}`,
      },
    };
  } catch (error: any) {
    console.error('Initiate payment error:', error);
    return {
      success: false,
      error: error.message || 'Failed to initiate payment',
    };
  }
};

/**
 * Verify payment callback
 */
export const verifyPayment = async (
  orderId: string,
  paymentId: string,
  signature: string
): Promise<ServiceResult> => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return {
        success: false,
        error: 'Order not found',
      };
    }

    // In real implementation, verify signature with Razorpay
    // For now, assume payment is successful

    // Calculate estimated delivery
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 4);

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        paymentId,
        estimatedDelivery,
      },
    });

    return {
      success: true,
      data: {
        message: 'Payment verified successfully',
        order: updatedOrder,
      },
    };
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return {
      success: false,
      error: error.message || 'Failed to verify payment',
    };
  }
};

/**
 * Track order
 */
export const trackOrder = async (
  userId: string,
  orderId: string
): Promise<ServiceResult> => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        estimatedDelivery: true,
        deliveredAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!order) {
      return {
        success: false,
        error: 'Order not found',
      };
    }

    // Build tracking timeline
    const timeline = [
      {
        status: 'PENDING',
        label: 'Order Placed',
        completed: true,
        timestamp: order.createdAt,
      },
      {
        status: 'CONFIRMED',
        label: 'Order Confirmed',
        completed: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status),
        timestamp: order.status !== 'PENDING' ? order.updatedAt : null,
      },
      {
        status: 'PROCESSING',
        label: 'Processing',
        completed: ['PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status),
        timestamp: null,
      },
      {
        status: 'SHIPPED',
        label: 'Shipped',
        completed: ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status),
        timestamp: null,
      },
      {
        status: 'OUT_FOR_DELIVERY',
        label: 'Out for Delivery',
        completed: ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status),
        timestamp: null,
      },
      {
        status: 'DELIVERED',
        label: 'Delivered',
        completed: order.status === 'DELIVERED',
        timestamp: order.deliveredAt,
      },
    ];

    return {
      success: true,
      data: {
        order,
        timeline,
        currentStatus: order.status,
        estimatedDelivery: order.estimatedDelivery,
      },
    };
  } catch (error: any) {
    console.error('Track order error:', error);
    return {
      success: false,
      error: error.message || 'Failed to track order',
    };
  }
};
