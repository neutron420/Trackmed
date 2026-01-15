import { z } from 'zod';

// ============================================
// AUTH SCHEMAS
// ============================================

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number'
      ),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number')
      .optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(1, 'Password is required'),
    deviceId: z.string().optional(),
    deviceName: z.string().optional(),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

// ============================================
// PROFILE SCHEMAS
// ============================================

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
    avatarUrl: z.string().url().optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number'
      ),
  }),
});

// ============================================
// ADDRESS SCHEMAS
// ============================================

export const createAddressSchema = z.object({
  body: z.object({
    label: z.string().max(50).optional(),
    fullName: z.string().min(2, 'Full name is required').max(100),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
    addressLine1: z.string().min(5, 'Address line 1 is required').max(200),
    addressLine2: z.string().max(200).optional(),
    city: z.string().min(2, 'City is required').max(100),
    state: z.string().min(2, 'State is required').max(100),
    pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode'),
    country: z.string().default('India'),
    landmark: z.string().max(200).optional(),
    isDefault: z.boolean().default(false),
  }),
});

export const updateAddressSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Address ID is required'),
  }),
  body: z.object({
    label: z.string().max(50).optional(),
    fullName: z.string().min(2).max(100).optional(),
    phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
    addressLine1: z.string().min(5).max(200).optional(),
    addressLine2: z.string().max(200).optional(),
    city: z.string().min(2).max(100).optional(),
    state: z.string().min(2).max(100).optional(),
    pincode: z.string().regex(/^\d{6}$/).optional(),
    landmark: z.string().max(200).optional(),
    isDefault: z.boolean().optional(),
  }),
});

// ============================================
// SCAN SCHEMAS
// ============================================

export const scanSchema = z.object({
  body: z.object({
    qrCode: z.string().min(1, 'QR code is required'),
    deviceId: z.string().optional(),
    deviceModel: z.string().optional(),
    deviceOS: z.string().optional(),
    appVersion: z.string().optional(),
    locationLat: z.number().min(-90).max(90).optional(),
    locationLng: z.number().min(-180).max(180).optional(),
    locationAddress: z.string().optional(),
  }),
});

// ============================================
// CART SCHEMAS
// ============================================

export const addToCartSchema = z.object({
  body: z.object({
    batchId: z.string().min(1, 'Batch ID is required'),
    quantity: z.number().int().positive('Quantity must be positive').default(1),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({
    batchId: z.string().min(1, 'Batch ID is required'),
  }),
  body: z.object({
    quantity: z.number().int().positive('Quantity must be positive'),
  }),
});

// ============================================
// ORDER SCHEMAS
// ============================================

export const createOrderSchema = z.object({
  body: z.object({
    addressId: z.string().min(1, 'Address ID is required'),
    paymentMethod: z.enum(['COD', 'RAZORPAY', 'UPI'], {
      errorMap: () => ({ message: 'Invalid payment method' }),
    }),
    notes: z.string().max(500).optional(),
    prescriptionUrl: z.string().url().optional(),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    razorpayPaymentId: z.string().min(1, 'Payment ID is required'),
    razorpayOrderId: z.string().min(1, 'Razorpay order ID is required'),
    razorpaySignature: z.string().min(1, 'Signature is required'),
  }),
});

// ============================================
// COMMON SCHEMAS
// ============================================

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
});

export const paginationSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  }),
});

export const searchSchema = z.object({
  query: z.object({
    q: z.string().min(2, 'Search query must be at least 2 characters'),
  }),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type CreateAddressInput = z.infer<typeof createAddressSchema>['body'];
export type ScanInput = z.infer<typeof scanSchema>['body'];
export type AddToCartInput = z.infer<typeof addToCartSchema>['body'];
export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];
