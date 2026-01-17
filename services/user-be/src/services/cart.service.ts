import prisma from '../config/database';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';

interface ServiceResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Get or create cart for user
 */
const getOrCreateCart = async (userId: string) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
    });
  }

  return cart;
};

/**
 * Get cart with items and details
 */
export const getCart = async (userId: string): Promise<ServiceResult> => {
  try {
    const cart = await getOrCreateCart(userId);

    const cartWithItems = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            batch: {
              include: {
                medicine: {
                  select: {
                    id: true,
                    name: true,
                    strength: true,
                    dosageForm: true,
                    mrp: true,
                    imageUrl: true,
                  },
                },
                manufacturer: {
                  select: {
                    name: true,
                    isVerified: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Calculate totals
    let subtotal = new Decimal(0);
    let totalItems = 0;
    const itemsWithDetails = (cartWithItems?.items || []).map((item: any) => {
      const unitPrice = item.batch.medicine.mrp;
      const itemTotal = unitPrice.mul(item.quantity);
      subtotal = subtotal.add(itemTotal);
      totalItems += item.quantity;

      return {
        id: item.id,
        batchId: item.batchId,
        quantity: item.quantity,
        unitPrice: unitPrice.toNumber(),
        totalPrice: itemTotal.toNumber(),
        medicine: item.batch.medicine,
        batch: {
          batchNumber: item.batch.batchNumber,
          expiryDate: item.batch.expiryDate,
          remainingQuantity: item.batch.remainingQuantity,
          status: item.batch.status,
        },
        manufacturer: item.batch.manufacturer,
        isAvailable:
          item.batch.status === 'VALID' &&
          new Date() < item.batch.expiryDate &&
          item.batch.remainingQuantity >= item.quantity,
      };
    });

    // Check for unavailable items
    const unavailableItems = itemsWithDetails.filter((item: any) => !item.isAvailable);

    return {
      success: true,
      data: {
        id: cart.id,
        items: itemsWithDetails,
        summary: {
          totalItems,
          itemCount: itemsWithDetails.length,
          subtotal: subtotal.toNumber(),
          tax: subtotal.mul(0.18).toNumber(), // 18% GST
          total: subtotal.mul(1.18).toNumber(),
        },
        hasUnavailableItems: unavailableItems.length > 0,
        unavailableItems: unavailableItems.map((i: any) => i.batchId),
      },
    };
  } catch (error: any) {
    console.error('Get cart error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get cart',
    };
  }
};

/**
 * Add item to cart
 */
export const addToCart = async (
  userId: string,
  batchId: string,
  quantity: number = 1
): Promise<ServiceResult> => {
  try {
    // Verify batch exists and is available
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        medicine: {
          select: { name: true },
        },
      },
    });

    if (!batch) {
      return {
        success: false,
        error: 'Batch not found',
      };
    }

    if (batch.status !== 'VALID') {
      return {
        success: false,
        error: 'This batch has been recalled and cannot be purchased',
      };
    }

    if (new Date() > batch.expiryDate) {
      return {
        success: false,
        error: 'This batch has expired',
      };
    }

    if (batch.remainingQuantity < quantity) {
      return {
        success: false,
        error: `Only ${batch.remainingQuantity} units available`,
      };
    }

    const cart = await getOrCreateCart(userId);

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_batchId: {
          cartId: cart.id,
          batchId,
        },
      },
    });

    let cartItem;
    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > batch.remainingQuantity) {
        return {
          success: false,
          error: `Cannot add more. Only ${batch.remainingQuantity} units available`,
        };
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          batchId,
          quantity,
        },
      });
    }

    return {
      success: true,
      data: {
        message: `${batch.medicine.name} added to cart`,
        cartItem,
      },
    };
  } catch (error: any) {
    console.error('Add to cart error:', error);
    return {
      success: false,
      error: error.message || 'Failed to add to cart',
    };
  }
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (
  userId: string,
  batchId: string,
  quantity: number
): Promise<ServiceResult> => {
  try {
    if (quantity < 1) {
      return removeFromCart(userId, batchId);
    }

    const cart = await getOrCreateCart(userId);

    // Find cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_batchId: {
          cartId: cart.id,
          batchId,
        },
      },
      include: {
        batch: true,
      },
    });

    if (!cartItem) {
      return {
        success: false,
        error: 'Item not found in cart',
      };
    }

    // Check availability
    if (quantity > cartItem.batch.remainingQuantity) {
      return {
        success: false,
        error: `Only ${cartItem.batch.remainingQuantity} units available`,
      };
    }

    const updated = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity },
    });

    return {
      success: true,
      data: updated,
    };
  } catch (error: any) {
    console.error('Update cart item error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update cart',
    };
  }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (
  userId: string,
  batchId: string
): Promise<ServiceResult> => {
  try {
    const cart = await getOrCreateCart(userId);

    const cartItem = await prisma.cartItem.findUnique({
      where: {
        cartId_batchId: {
          cartId: cart.id,
          batchId,
        },
      },
    });

    if (!cartItem) {
      return {
        success: false,
        error: 'Item not found in cart',
      };
    }

    await prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    return {
      success: true,
      data: { message: 'Item removed from cart' },
    };
  } catch (error: any) {
    console.error('Remove from cart error:', error);
    return {
      success: false,
      error: error.message || 'Failed to remove from cart',
    };
  }
};

/**
 * Clear entire cart
 */
export const clearCart = async (userId: string): Promise<ServiceResult> => {
  try {
    const cart = await getOrCreateCart(userId);

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return {
      success: true,
      data: { message: 'Cart cleared' },
    };
  } catch (error: any) {
    console.error('Clear cart error:', error);
    return {
      success: false,
      error: error.message || 'Failed to clear cart',
    };
  }
};

/**
 * Get cart item count
 */
export const getCartCount = async (userId: string): Promise<ServiceResult> => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        _count: {
          select: { items: true },
        },
        items: {
          select: { quantity: true },
        },
      },
    });

    if (!cart) {
      return {
        success: true,
        data: { itemCount: 0, totalUnits: 0 },
      };
    }

    const totalUnits = cart.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);

    return {
      success: true,
      data: {
        itemCount: cart._count.items,
        totalUnits,
      },
    };
  } catch (error: any) {
    console.error('Get cart count error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get cart count',
    };
  }
};
