import prisma from '../config/database';

interface ServiceResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Scan QR code and get medicine/batch details
 */
export const scanQRCode = async (
  qrCode: string,
  userId?: string,
  deviceInfo?: {
    deviceId?: string;
    deviceModel?: string;
    deviceOS?: string;
    appVersion?: string;
    locationLat?: number;
    locationLng?: number;
    locationAddress?: string;
  }
): Promise<ServiceResult> => {
  try {
    // Find QR code
    const qrCodeRecord = await prisma.qRCode.findUnique({
      where: { code: qrCode },
      include: {
        batch: {
          include: {
            medicine: true,
            manufacturer: {
              select: {
                id: true,
                name: true,
                licenseNumber: true,
                address: true,
                city: true,
                state: true,
                country: true,
                isVerified: true,
              },
            },
          },
        },
      },
    });

    if (!qrCodeRecord) {
      // Log potential fraud - invalid QR code
      return {
        success: false,
        error: 'Invalid QR code. This medicine may be counterfeit.',
      };
    }

    if (!qrCodeRecord.isActive) {
      return {
        success: false,
        error: 'This QR code has been deactivated.',
      };
    }

    const batch = qrCodeRecord.batch;
    const medicine = batch.medicine;
    const manufacturer = batch.manufacturer;

    // Check batch status
    const isRecalled = batch.status === 'RECALLED';
    const isExpired = new Date() > batch.expiryDate;

    // Determine verification status
    let verificationStatus: 'AUTHENTIC' | 'RECALLED' | 'EXPIRED' | 'WARNING' = 'AUTHENTIC';
    let verificationMessage = 'This medicine is authentic and verified.';

    if (isRecalled) {
      verificationStatus = 'RECALLED';
      verificationMessage = 'WARNING: This batch has been recalled. Do not consume.';
    } else if (isExpired) {
      verificationStatus = 'EXPIRED';
      verificationMessage = 'WARNING: This medicine has expired.';
    } else if (!manufacturer.isVerified) {
      verificationStatus = 'WARNING';
      verificationMessage = 'The manufacturer of this medicine is not verified.';
    }

    // Log the scan
    await prisma.scanLog.create({
      data: {
        qrCodeId: qrCodeRecord.id,
        batchId: batch.id,
        userId: userId || null,
        deviceId: deviceInfo?.deviceId,
        deviceModel: deviceInfo?.deviceModel,
        deviceOS: deviceInfo?.deviceOS,
        appVersion: deviceInfo?.appVersion,
        locationLat: deviceInfo?.locationLat,
        locationLng: deviceInfo?.locationLng,
        locationAddress: deviceInfo?.locationAddress,
        scanType: 'VERIFICATION',
        blockchainVerified: !!batch.blockchainTxHash,
        blockchainStatus: batch.status,
      },
    });

    // Prepare response
    const response = {
      verification: {
        status: verificationStatus,
        message: verificationMessage,
        isAuthentic: verificationStatus === 'AUTHENTIC',
        blockchainVerified: !!batch.blockchainTxHash,
      },
      medicine: {
        id: medicine.id,
        name: medicine.name,
        genericName: medicine.genericName,
        strength: medicine.strength,
        composition: medicine.composition,
        dosageForm: medicine.dosageForm,
        mrp: medicine.mrp,
        storageCondition: medicine.storageCondition,
        description: medicine.description,
        imageUrl: medicine.imageUrl,
      },
      batch: {
        id: batch.id,
        batchNumber: batch.batchNumber,
        manufacturingDate: batch.manufacturingDate,
        expiryDate: batch.expiryDate,
        status: batch.status,
        isExpired,
        daysUntilExpiry: Math.ceil(
          (batch.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ),
      },
      manufacturer: {
        name: manufacturer.name,
        licenseNumber: manufacturer.licenseNumber,
        address: manufacturer.address,
        city: manufacturer.city,
        state: manufacturer.state,
        country: manufacturer.country,
        isVerified: manufacturer.isVerified,
      },
      qrCode: {
        id: qrCodeRecord.id,
        unitNumber: qrCodeRecord.unitNumber,
      },
      // For adding to cart
      canPurchase: verificationStatus === 'AUTHENTIC' && batch.remainingQuantity > 0,
      availableQuantity: batch.remainingQuantity,
    };

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error('Scan QR code error:', error);
    return {
      success: false,
      error: error.message || 'Failed to scan QR code',
    };
  }
};

/**
 * Get medicine details by ID
 */
export const getMedicineById = async (medicineId: string): Promise<ServiceResult> => {
  try {
    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId },
      include: {
        batches: {
          where: {
            status: 'VALID',
            expiryDate: { gt: new Date() },
            remainingQuantity: { gt: 0 },
            lifecycleStatus: 'AT_PHARMACY',
          },
          select: {
            id: true,
            batchNumber: true,
            expiryDate: true,
            remainingQuantity: true,
            manufacturer: {
              select: {
                name: true,
                isVerified: true,
              },
            },
          },
          orderBy: { expiryDate: 'asc' },
          take: 5,
        },
      },
    });

    if (!medicine) {
      return {
        success: false,
        error: 'Medicine not found',
      };
    }

    return {
      success: true,
      data: {
        ...medicine,
        availableBatches: medicine.batches,
      },
    };
  } catch (error: any) {
    console.error('Get medicine error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get medicine',
    };
  }
};

/**
 * Get batch details by ID
 */
export const getBatchById = async (batchId: string): Promise<ServiceResult> => {
  try {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        medicine: true,
        manufacturer: {
          select: {
            id: true,
            name: true,
            licenseNumber: true,
            address: true,
            city: true,
            state: true,
            isVerified: true,
          },
        },
      },
    });

    if (!batch) {
      return {
        success: false,
        error: 'Batch not found',
      };
    }

    const isExpired = new Date() > batch.expiryDate;

    return {
      success: true,
      data: {
        ...batch,
        isExpired,
        daysUntilExpiry: Math.ceil(
          (batch.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ),
        canPurchase:
          batch.status === 'VALID' &&
          !isExpired &&
          batch.remainingQuantity > 0,
      },
    };
  } catch (error: any) {
    console.error('Get batch error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get batch',
    };
  }
};

/**
 * Search medicines by name
 */
export const searchMedicines = async (
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<ServiceResult> => {
  try {
    const skip = (page - 1) * limit;

    const [medicines, total] = await Promise.all([
      prisma.medicine.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { genericName: { contains: query, mode: 'insensitive' } },
            { composition: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          _count: {
            select: {
              batches: {
                where: {
                  status: 'VALID',
                  expiryDate: { gt: new Date() },
                  remainingQuantity: { gt: 0 },
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.medicine.count({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { genericName: { contains: query, mode: 'insensitive' } },
            { composition: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    return {
      success: true,
      data: {
        medicines: medicines.map((m: any) => ({
          ...m,
          availableBatchCount: (m._count as any).batches,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error: any) {
    console.error('Search medicines error:', error);
    return {
      success: false,
      error: error.message || 'Failed to search medicines',
    };
  }
};

/**
 * Get user's scan history
 */
export const getScanHistory = async (
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<ServiceResult> => {
  try {
    const skip = (page - 1) * limit;

    const [scans, total] = await Promise.all([
      prisma.scanLog.findMany({
        where: { userId },
        include: {
          batch: {
            include: {
              medicine: {
                select: {
                  name: true,
                  strength: true,
                  dosageForm: true,
                  imageUrl: true,
                },
              },
              manufacturer: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.scanLog.count({
        where: { userId },
      }),
    ]);

    return {
      success: true,
      data: {
        scans,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error: any) {
    console.error('Get scan history error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get scan history',
    };
  }
};
