import {
  registerSchema,
  loginSchema,
  createManufacturerSchema,
  createMedicineSchema,
  createBatchSchema,
  scanQRCodeSchema,
} from '../validation/schemas';

describe('Validation Schemas', () => {
  describe('Auth Schemas', () => {
    describe('registerSchema', () => {
      it('should validate valid registration data', () => {
        const validData = {
          body: {
            email: 'test@example.com',
            password: 'Password123',
            name: 'John Doe',
            role: 'ADMIN',
          },
        };
        
        const result = registerSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should reject invalid email', () => {
        const invalidData = {
          body: {
            email: 'invalid-email',
            password: 'Password123',
            role: 'ADMIN',
          },
        };
        
        const result = registerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject short password', () => {
        const invalidData = {
          body: {
            email: 'test@example.com',
            password: 'short',
            role: 'ADMIN',
          },
        };
        
        const result = registerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });

      it('should reject invalid role', () => {
        const invalidData = {
          body: {
            email: 'test@example.com',
            password: 'Password123',
            role: 'INVALID_ROLE',
          },
        };
        
        const result = registerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe('loginSchema', () => {
      it('should validate valid login data', () => {
        const validData = {
          body: {
            email: 'test@example.com',
            password: 'anypassword',
          },
        };
        
        const result = loginSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should reject missing password', () => {
        const invalidData = {
          body: {
            email: 'test@example.com',
          },
        };
        
        const result = loginSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Manufacturer Schema', () => {
    it('should validate valid manufacturer data', () => {
      const validData = {
        body: {
          name: 'Pharma Corp',
          licenseNumber: 'LIC-123456',
          address: '123 Pharma Street',
          walletAddress: 'ABC123DEF456GHI789JKL012MNO345PQR',
        },
      };
      
      const result = createManufacturerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing wallet address', () => {
      const invalidData = {
        body: {
          name: 'Pharma Corp',
          licenseNumber: 'LIC-123456',
          address: '123 Pharma Street',
        },
      };
      
      const result = createManufacturerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Medicine Schema', () => {
    it('should validate valid medicine data', () => {
      const validData = {
        body: {
          name: 'Paracetamol',
          strength: '500mg',
          composition: 'Paracetamol IP 500mg',
          dosageForm: 'Tablet',
          mrp: 25.50,
        },
      };
      
      const result = createMedicineSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid dosage form', () => {
      const invalidData = {
        body: {
          name: 'Paracetamol',
          strength: '500mg',
          composition: 'Paracetamol IP 500mg',
          dosageForm: 'InvalidForm',
          mrp: 25.50,
        },
      };
      
      const result = createMedicineSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative MRP', () => {
      const invalidData = {
        body: {
          name: 'Paracetamol',
          strength: '500mg',
          composition: 'Paracetamol IP 500mg',
          dosageForm: 'Tablet',
          mrp: -10,
        },
      };
      
      const result = createMedicineSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Batch Schema', () => {
    it('should validate valid batch data', () => {
      const validData = {
        body: {
          batchNumber: 'BN-2026-001',
          manufacturerId: 'mfr-123',
          medicineId: 'med-456',
          quantity: 1000,
          manufacturingDate: '2026-01-01',
          expiryDate: '2028-01-01',
        },
      };
      
      const result = createBatchSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject zero quantity', () => {
      const invalidData = {
        body: {
          batchNumber: 'BN-2026-001',
          manufacturerId: 'mfr-123',
          medicineId: 'med-456',
          quantity: 0,
          manufacturingDate: '2026-01-01',
          expiryDate: '2028-01-01',
        },
      };
      
      const result = createBatchSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Scan QR Code Schema', () => {
    it('should validate valid scan data', () => {
      const validData = {
        body: {
          qrCode: 'QR-CODE-12345',
          scanType: 'VERIFICATION',
        },
      };
      
      const result = scanQRCodeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate scan with location', () => {
      const validData = {
        body: {
          qrCode: 'QR-CODE-12345',
          locationLat: 28.6139,
          locationLng: 77.2090,
          locationAddress: 'New Delhi, India',
        },
      };
      
      const result = scanQRCodeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid latitude', () => {
      const invalidData = {
        body: {
          qrCode: 'QR-CODE-12345',
          locationLat: 100, // Invalid: max is 90
          locationLng: 77.2090,
        },
      };
      
      const result = scanQRCodeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
