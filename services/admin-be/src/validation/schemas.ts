import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    role: z.enum(['ADMIN', 'MANUFACTURER'], {
      errorMap: () => ({ message: 'Role must be ADMIN or MANUFACTURER' }),
    }),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// ============================================
// MANUFACTURER SCHEMAS
// ============================================

export const createManufacturerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    licenseNumber: z.string().min(1, 'License number is required'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().default('India'),
    phone: z.string().regex(/^[0-9+\-\s]+$/, 'Invalid phone number').optional(),
    email: z.string().email('Invalid email').optional(),
    gstNumber: z.string().regex(/^[0-9A-Z]{15}$/, 'Invalid GST number').optional(),
    walletAddress: z.string().min(32, 'Valid wallet address is required'),
  }),
});

export const updateManufacturerSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    address: z.string().min(5).optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    phone: z.string().regex(/^[0-9+\-\s]+$/).optional(),
    email: z.string().email().optional(),
    gstNumber: z.string().regex(/^[0-9A-Z]{15}$/).optional(),
    isVerified: z.boolean().optional(),
  }),
});

// ============================================
// MEDICINE SCHEMAS
// ============================================

export const createMedicineSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    genericName: z.string().optional(),
    strength: z.string().min(1, 'Strength is required'),
    composition: z.string().min(1, 'Composition is required'),
    dosageForm: z.enum(['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Inhaler', 'Powder', 'Gel', 'Other'], {
      errorMap: () => ({ message: 'Invalid dosage form' }),
    }),
    mrp: z.number().positive('MRP must be positive'),
    storageCondition: z.string().optional(),
    imageUrl: z.string().url('Invalid image URL').optional(),
    description: z.string().optional(),
  }),
});

export const updateMedicineSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    genericName: z.string().optional(),
    strength: z.string().optional(),
    composition: z.string().optional(),
    dosageForm: z.enum(['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Inhaler', 'Powder', 'Gel', 'Other']).optional(),
    mrp: z.number().positive().optional(),
    storageCondition: z.string().optional(),
    imageUrl: z.string().url().optional(),
    description: z.string().optional(),
  }),
});

// ============================================
// BATCH SCHEMAS
// ============================================

export const createBatchSchema = z.object({
  body: z.object({
    batchNumber: z.string().min(1, 'Batch number is required'),
    manufacturerId: z.string().min(1, 'Manufacturer ID is required'),
    medicineId: z.string().min(1, 'Medicine ID is required'),
    quantity: z.number().int().positive('Quantity must be a positive integer'),
    manufacturingDate: z.string().datetime({ message: 'Invalid manufacturing date' }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    expiryDate: z.string().datetime({ message: 'Invalid expiry date' }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    invoiceNumber: z.string().optional(),
    invoiceDate: z.string().datetime().optional(),
    gstNumber: z.string().optional(),
    warehouseLocation: z.string().optional(),
    warehouseAddress: z.string().optional(),
  }),
});

export const updateBatchStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
  body: z.object({
    status: z.enum(['VALID', 'RECALLED'], {
      errorMap: () => ({ message: 'Status must be VALID or RECALLED' }),
    }),
  }),
});

export const updateLifecycleStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
  body: z.object({
    lifecycleStatus: z.enum(['IN_PRODUCTION', 'IN_TRANSIT', 'AT_DISTRIBUTOR', 'AT_PHARMACY', 'SOLD', 'EXPIRED', 'RECALLED'], {
      errorMap: () => ({ message: 'Invalid lifecycle status' }),
    }),
    distributorId: z.string().optional(),
    pharmacyId: z.string().optional(),
  }),
});

// ============================================
// SCAN SCHEMAS
// ============================================

export const scanQRCodeSchema = z.object({
  body: z.object({
    qrCode: z.string().min(1, 'QR code is required'),
    deviceId: z.string().optional(),
    deviceModel: z.string().optional(),
    deviceOS: z.string().optional(),
    appVersion: z.string().optional(),
    locationLat: z.number().min(-90).max(90).optional(),
    locationLng: z.number().min(-180).max(180).optional(),
    locationAddress: z.string().optional(),
    scanType: z.enum(['VERIFICATION', 'PURCHASE', 'DISTRIBUTION', 'RECALL_CHECK']).default('VERIFICATION'),
  }),
});

// ============================================
// DISTRIBUTOR & PHARMACY SCHEMAS
// ============================================

export const createDistributorSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    licenseNumber: z.string().min(1, 'License number is required'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().default('India'),
    phone: z.string().regex(/^[0-9+\-\s]+$/, 'Invalid phone number').optional(),
    email: z.string().email('Invalid email').optional(),
    gstNumber: z.string().optional(),
  }),
});

export const createPharmacySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    licenseNumber: z.string().min(1, 'License number is required'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().default('India'),
    phone: z.string().regex(/^[0-9+\-\s]+$/, 'Invalid phone number').optional(),
    email: z.string().email('Invalid email').optional(),
    gstNumber: z.string().optional(),
  }),
});

// ============================================
// USER SCHEMAS
// ============================================

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().regex(/^[0-9+\-\s]+$/).optional(),
    isActive: z.boolean().optional(),
    role: z.enum(['ADMIN', 'SUPERADMIN', 'MANUFACTURER', 'DISTRIBUTOR', 'PHARMACY', 'SCANNER', 'CONSUMER']).optional(),
  }),
});

// ============================================
// PAGINATION & COMMON SCHEMAS
// ============================================

export const paginationSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID is required'),
  }),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type CreateManufacturerInput = z.infer<typeof createManufacturerSchema>['body'];
export type CreateMedicineInput = z.infer<typeof createMedicineSchema>['body'];
export type CreateBatchInput = z.infer<typeof createBatchSchema>['body'];
export type ScanQRCodeInput = z.infer<typeof scanQRCodeSchema>['body'];
