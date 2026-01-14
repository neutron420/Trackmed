import prisma from '../config/database';

interface UpdateProfileInput {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}

interface AddressInput {
  label?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  landmark?: string;
  isDefault?: boolean;
}

interface ServiceResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Get user profile
 */
export const getProfile = async (userId: string): Promise<ServiceResult> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            addresses: true,
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error: any) {
    console.error('Get profile error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get profile',
    };
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (
  userId: string,
  input: UpdateProfileInput
): Promise<ServiceResult> => {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name,
        phone: input.phone,
        avatarUrl: input.avatarUrl,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatarUrl: true,
        role: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      data: user,
    };
  } catch (error: any) {
    console.error('Update profile error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update profile',
    };
  }
};

/**
 * Delete user account (soft delete - deactivate)
 */
export const deleteAccount = async (userId: string): Promise<ServiceResult> => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    // Revoke all refresh tokens
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Delete account error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete account',
    };
  }
};

// ==================== ADDRESS MANAGEMENT ====================

/**
 * Get all addresses for a user
 */
export const getAddresses = async (userId: string): Promise<ServiceResult> => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return {
      success: true,
      data: addresses,
    };
  } catch (error: any) {
    console.error('Get addresses error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get addresses',
    };
  }
};

/**
 * Add a new address
 */
export const addAddress = async (
  userId: string,
  input: AddressInput
): Promise<ServiceResult> => {
  try {
    // If this is set as default, unset other defaults
    if (input.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // If this is the first address, make it default
    const addressCount = await prisma.address.count({
      where: { userId },
    });

    const address = await prisma.address.create({
      data: {
        userId,
        label: input.label,
        fullName: input.fullName,
        phone: input.phone,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        country: input.country || 'India',
        landmark: input.landmark,
        isDefault: input.isDefault || addressCount === 0,
      },
    });

    return {
      success: true,
      data: address,
    };
  } catch (error: any) {
    console.error('Add address error:', error);
    return {
      success: false,
      error: error.message || 'Failed to add address',
    };
  }
};

/**
 * Update an address
 */
export const updateAddress = async (
  userId: string,
  addressId: string,
  input: Partial<AddressInput>
): Promise<ServiceResult> => {
  try {
    // Verify address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existingAddress) {
      return {
        success: false,
        error: 'Address not found',
      };
    }

    // If setting as default, unset other defaults
    if (input.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id: addressId },
      data: {
        label: input.label,
        fullName: input.fullName,
        phone: input.phone,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        country: input.country,
        landmark: input.landmark,
        isDefault: input.isDefault,
      },
    });

    return {
      success: true,
      data: address,
    };
  } catch (error: any) {
    console.error('Update address error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update address',
    };
  }
};

/**
 * Delete an address
 */
export const deleteAddress = async (
  userId: string,
  addressId: string
): Promise<ServiceResult> => {
  try {
    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      return {
        success: false,
        error: 'Address not found',
      };
    }

    // Check if address is used in any orders
    const ordersWithAddress = await prisma.order.count({
      where: { addressId },
    });

    if (ordersWithAddress > 0) {
      return {
        success: false,
        error: 'Cannot delete address used in orders',
      };
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    // If deleted address was default, set another as default
    if (address.isDefault) {
      const firstAddress = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      if (firstAddress) {
        await prisma.address.update({
          where: { id: firstAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Delete address error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete address',
    };
  }
};

/**
 * Set address as default
 */
export const setDefaultAddress = async (
  userId: string,
  addressId: string
): Promise<ServiceResult> => {
  try {
    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      return {
        success: false,
        error: 'Address not found',
      };
    }

    // Unset all other defaults
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    // Set new default
    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    return {
      success: true,
      data: updatedAddress,
    };
  } catch (error: any) {
    console.error('Set default address error:', error);
    return {
      success: false,
      error: error.message || 'Failed to set default address',
    };
  }
};
