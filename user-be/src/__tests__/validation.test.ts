import {
  registerSchema,
  loginSchema,
  createAddressSchema,
  scanSchema,
  addToCartSchema,
  createOrderSchema,
} from '../validation/schemas';

describe('User-BE Validation Schemas', () => {
  describe('Auth Schemas', () => {
    describe('registerSchema', () => {
      it('should validate valid registration', () => {
        const validData = {
          body: {
            email: 'user@example.com',
            password: 'Password123',
            name: 'John Doe',
            phone: '9876543210',
          },
        };
        
        const result = registerSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should reject weak password', () => {
        const invalidData = {
          body: {
            email: 'user@example.com',
            password: 'password', // No uppercase or number
            name: 'John Doe',
          },
        };
        
        const result = registerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject invalid Indian phone', () => {
        const invalidData = {
          body: {
            email: 'user@example.com',
            password: 'Password123',
            name: 'John Doe',
            phone: '1234567890', // Doesn't start with 6-9
          },
        };
        
        const result = registerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe('loginSchema', () => {
      it('should validate login with device info', () => {
        const validData = {
          body: {
            email: 'user@example.com',
            password: 'password123',
            deviceId: 'device-uuid',
            deviceName: 'iPhone 15',
          },
        };
        
        const result = loginSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Address Schema', () => {
    it('should validate valid address', () => {
      const validData = {
        body: {
          fullName: 'John Doe',
          phone: '9876543210',
          addressLine1: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
        },
      };
      
      const result = createAddressSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid pincode', () => {
      const invalidData = {
        body: {
          fullName: 'John Doe',
          phone: '9876543210',
          addressLine1: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '12345', // Should be 6 digits
        },
      };
      
      const result = createAddressSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Scan Schema', () => {
    it('should validate scan with location', () => {
      const validData = {
        body: {
          qrCode: 'QR-12345',
          deviceId: 'device-123',
          locationLat: 19.0760,
          locationLng: 72.8777,
        },
      };
      
      const result = scanSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing QR code', () => {
      const invalidData = {
        body: {
          deviceId: 'device-123',
        },
      };
      
      const result = scanSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Cart Schema', () => {
    it('should validate add to cart', () => {
      const validData = {
        body: {
          batchId: 'batch-123',
          quantity: 2,
        },
      };
      
      const result = addToCartSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should default quantity to 1', () => {
      const validData = {
        body: {
          batchId: 'batch-123',
        },
      };
      
      const result = addToCartSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.body.quantity).toBe(1);
      }
    });

    it('should reject negative quantity', () => {
      const invalidData = {
        body: {
          batchId: 'batch-123',
          quantity: -1,
        },
      };
      
      const result = addToCartSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Order Schema', () => {
    it('should validate valid order', () => {
      const validData = {
        body: {
          addressId: 'addr-123',
          paymentMethod: 'COD',
        },
      };
      
      const result = createOrderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate order with notes', () => {
      const validData = {
        body: {
          addressId: 'addr-123',
          paymentMethod: 'RAZORPAY',
          notes: 'Please call before delivery',
        },
      };
      
      const result = createOrderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid payment method', () => {
      const invalidData = {
        body: {
          addressId: 'addr-123',
          paymentMethod: 'INVALID',
        },
      };
      
      const result = createOrderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
