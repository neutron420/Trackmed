import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

/**
 * Validation middleware factory using Zod
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};

/**
 * Common validation schemas
 */
export const schemas = {
  // Auth schemas
  register: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
      name: z.string().min(2).max(100).optional(),
      role: z.enum(['ADMIN', 'MANUFACTURER']),
    }),
  }),

  login: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(1, 'Password is required'),
    }),
  }),

  // ID param validation
  idParam: z.object({
    params: z.object({
      id: z.string().min(1, 'ID is required'),
    }),
  }),

  // Pagination query validation
  pagination: z.object({
    query: z.object({
      page: z.string().regex(/^\d+$/).optional(),
      limit: z.string().regex(/^\d+$/).optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
    }),
  }),

  // Batch registration
  batchRegister: z.object({
    body: z.object({
      batchHash: z.string().min(1),
      batchNumber: z.string().min(1),
      manufacturingDate: z.string().datetime().or(z.string().min(1)),
      expiryDate: z.string().datetime().or(z.string().min(1)),
      manufacturerId: z.string().min(1),
      medicineId: z.string().min(1),
      quantity: z.number().int().positive().or(z.string().regex(/^\d+$/)),
      invoiceNumber: z.string().optional(),
      invoiceDate: z.string().optional(),
      gstNumber: z.string().optional(),
      warehouseLocation: z.string().optional(),
      warehouseAddress: z.string().optional(),
      manufacturerWalletPrivateKey: z.string().min(1),
    }),
  }),
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate UUID format
 */
export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Validate CUID format (Prisma default)
 */
export const isValidCUID = (id: string): boolean => {
  const cuidRegex = /^c[a-z0-9]{24}$/;
  return cuidRegex.test(id);
};
