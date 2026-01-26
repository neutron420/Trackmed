import prisma from "../config/database";
import { PublicKey } from "@solana/web3.js";
import {
  fetchBatchFromBlockchain,
  parseBatchStatus,
  deriveBatchPDA,
} from "../config/solana";

interface ServiceResult {
  success: boolean;
  error?: string;
  data?: any;
}

// Verification status types
type VerificationStatus =
  | "AUTHENTIC"
  | "EXPIRED"
  | "EXPIRING_SOON"
  | "RECALLED"
  | "WARNING"
  | "COUNTERFEIT";

/**
 * Verify batch data against blockchain
 * This is the core security check - blockchain data is immutable
 */
async function verifyBatchOnBlockchain(
  manufacturerWalletAddress: string,
  batchHash: string,
  dbExpiryDate: Date,
  dbStatus: string,
): Promise<{
  verified: boolean;
  blockchainStatus?: "VALID" | "SUSPENDED" | "RECALLED";
  blockchainExpiryDate?: Date;
  warning?: string;
  error?: string;
}> {
  try {
    // Convert wallet address string to PublicKey
    const manufacturerWallet = new PublicKey(manufacturerWalletAddress);

    // Fetch batch data from Solana blockchain
    const blockchainBatch = await fetchBatchFromBlockchain(
      manufacturerWallet,
      batchHash,
    );

    if (!blockchainBatch) {
      return {
        verified: false,
        warning:
          "Batch not found on blockchain. This could indicate a recently registered batch or potential tampering.",
      };
    }

    // Parse blockchain data
    const blockchainStatus = parseBatchStatus(blockchainBatch.status);
    const blockchainExpiryTimestamp = Number(blockchainBatch.expiryDate);
    const blockchainExpiryDate = new Date(blockchainExpiryTimestamp * 1000);

    // Verify: Compare blockchain expiry date with database
    // Allow 1 day tolerance for timezone differences
    const dbExpiryTimestamp = Math.floor(dbExpiryDate.getTime() / 1000);
    const expiryDifference = Math.abs(
      blockchainExpiryTimestamp - dbExpiryTimestamp,
    );
    const ONE_DAY_IN_SECONDS = 86400;

    if (expiryDifference > ONE_DAY_IN_SECONDS) {
      return {
        verified: false,
        blockchainStatus,
        blockchainExpiryDate,
        warning:
          "CRITICAL: Database expiry date does not match blockchain. Possible data tampering detected!",
      };
    }

    // Verify: Check if blockchain status is more severe than database
    // Blockchain is the source of truth for recalls
    if (blockchainStatus === "RECALLED" && dbStatus !== "RECALLED") {
      return {
        verified: true,
        blockchainStatus,
        blockchainExpiryDate,
        warning:
          "Blockchain shows batch as RECALLED but database not updated. Using blockchain status.",
      };
    }

    return {
      verified: true,
      blockchainStatus,
      blockchainExpiryDate,
    };
  } catch (error: any) {
    console.error("[BlockchainVerify] Error:", error.message);
    return {
      verified: false,
      error: error.message || "Failed to verify on blockchain",
    };
  }
}

/**
 * Scan QR code and get medicine/batch details with BLOCKCHAIN VERIFICATION
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
  },
): Promise<ServiceResult> => {
  try {
    // Step 1: Find QR code in database
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
                walletAddress: true, // Needed for blockchain verification
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
        error: "Invalid QR code. This medicine may be counterfeit.",
      };
    }

    if (!qrCodeRecord.isActive) {
      return {
        success: false,
        error: "This QR code has been deactivated.",
      };
    }

    const batch = qrCodeRecord.batch;
    const medicine = batch.medicine;
    const manufacturer = batch.manufacturer;

    // Step 2: BLOCKCHAIN VERIFICATION (Immutable Source of Truth)
    let blockchainVerified = false;
    let blockchainWarning: string | undefined;
    let blockchainStatus: "VALID" | "SUSPENDED" | "RECALLED" | undefined;
    let blockchainExpiryDate: Date | undefined;

    // Only verify on blockchain if batch has a batchHash and manufacturer has wallet
    if (batch.batchHash && manufacturer.walletAddress) {
      const blockchainResult = await verifyBatchOnBlockchain(
        manufacturer.walletAddress,
        batch.batchHash,
        batch.expiryDate,
        batch.status,
      );

      blockchainVerified = blockchainResult.verified;
      blockchainWarning = blockchainResult.warning || blockchainResult.error;
      blockchainStatus = blockchainResult.blockchainStatus;
      blockchainExpiryDate = blockchainResult.blockchainExpiryDate;
    }

    // Step 3: Determine verification status (prioritize blockchain data)
    // Use blockchain expiry date if available, otherwise use database
    const effectiveExpiryDate = blockchainExpiryDate || batch.expiryDate;
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (effectiveExpiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Use blockchain status if available (it's immutable and more trustworthy)
    const effectiveStatus = blockchainStatus || batch.status;
    const isRecalled = effectiveStatus === "RECALLED";
    const isSuspended = effectiveStatus === "SUSPENDED";
    const isExpired = daysUntilExpiry < 0;
    const isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 30;

    // Determine final verification status and message
    let verificationStatus: VerificationStatus = "AUTHENTIC";
    let verificationMessage =
      "This medicine is authentic and verified on blockchain.";
    let statusColor = "green"; // For mobile app UI

    if (!blockchainVerified && batch.batchHash) {
      // Has batch hash but couldn't verify on blockchain
      verificationStatus = "WARNING";
      verificationMessage =
        blockchainWarning ||
        "Could not verify on blockchain. Proceed with caution.";
      statusColor = "yellow";
    } else if (isRecalled) {
      verificationStatus = "RECALLED";
      verificationMessage =
        "WARNING: This batch has been recalled. Do not consume.";
      statusColor = "red";
    } else if (isSuspended) {
      verificationStatus = "WARNING";
      verificationMessage =
        "WARNING: This batch has been suspended. Contact manufacturer.";
      statusColor = "yellow";
    } else if (isExpired) {
      verificationStatus = "EXPIRED";
      verificationMessage = `WARNING: This medicine expired ${Math.abs(
        daysUntilExpiry,
      )} days ago. Do not use.`;
      statusColor = "red";
    } else if (isExpiringSoon) {
      verificationStatus = "EXPIRING_SOON";
      verificationMessage = `This medicine is authentic but expires in ${daysUntilExpiry} days. Use before expiry.`;
      statusColor = "orange";
    } else if (!manufacturer.isVerified) {
      verificationStatus = "WARNING";
      verificationMessage =
        "The manufacturer of this medicine is not verified.";
      statusColor = "yellow";
    }

    // Step 4: Log the scan
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
        scanType: "VERIFICATION",
        blockchainVerified: blockchainVerified,
        blockchainStatus: effectiveStatus,
      },
    });

    // Step 5: Prepare response for mobile app
    const response = {
      // Primary verification result (what app should show to user)
      verification: {
        status: verificationStatus,
        message: verificationMessage,
        statusColor: statusColor,
        isAuthentic:
          verificationStatus === "AUTHENTIC" ||
          verificationStatus === "EXPIRING_SOON",
        blockchainVerified: blockchainVerified,
        blockchainWarning: blockchainWarning,
      },
      // Medicine details
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
      // Batch details (use blockchain data where available)
      batch: {
        id: batch.id,
        batchNumber: batch.batchNumber,
        batchHash: batch.batchHash,
        manufacturingDate: batch.manufacturingDate,
        expiryDate: effectiveExpiryDate, // Use blockchain expiry if available
        status: effectiveStatus, // Use blockchain status if available
        isExpired,
        isExpiringSoon,
        daysUntilExpiry,
      },
      // Manufacturer details
      manufacturer: {
        name: manufacturer.name,
        licenseNumber: manufacturer.licenseNumber,
        address: manufacturer.address,
        city: manufacturer.city,
        state: manufacturer.state,
        country: manufacturer.country,
        isVerified: manufacturer.isVerified,
      },
      // QR code info
      qrCode: {
        id: qrCodeRecord.id,
        unitNumber: qrCodeRecord.unitNumber,
      },
      // For adding to cart
      canPurchase:
        (verificationStatus === "AUTHENTIC" ||
          verificationStatus === "EXPIRING_SOON") &&
        batch.remainingQuantity > 0,
      availableQuantity: batch.remainingQuantity,
    };

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error("Scan QR code error:", error);
    return {
      success: false,
      error: error.message || "Failed to scan QR code",
    };
  }
};

/**
 * Get medicine details by ID
 */
export const getMedicineById = async (
  medicineId: string,
): Promise<ServiceResult> => {
  try {
    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId },
      include: {
        batches: {
          where: {
            status: "VALID",
            expiryDate: { gt: new Date() },
            remainingQuantity: { gt: 0 },
            lifecycleStatus: "AT_PHARMACY",
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
          orderBy: { expiryDate: "asc" },
          take: 5,
        },
      },
    });

    if (!medicine) {
      return {
        success: false,
        error: "Medicine not found",
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
    console.error("Get medicine error:", error);
    return {
      success: false,
      error: error.message || "Failed to get medicine",
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
        error: "Batch not found",
      };
    }

    const isExpired = new Date() > batch.expiryDate;

    return {
      success: true,
      data: {
        ...batch,
        isExpired,
        daysUntilExpiry: Math.ceil(
          (batch.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        ),
        canPurchase:
          batch.status === "VALID" && !isExpired && batch.remainingQuantity > 0,
      },
    };
  } catch (error: any) {
    console.error("Get batch error:", error);
    return {
      success: false,
      error: error.message || "Failed to get batch",
    };
  }
};

/**
 * Search medicines by name
 */
export const searchMedicines = async (
  query: string,
  page: number = 1,
  limit: number = 20,
): Promise<ServiceResult> => {
  try {
    const skip = (page - 1) * limit;

    const [medicines, total] = await Promise.all([
      prisma.medicine.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { genericName: { contains: query, mode: "insensitive" } },
            { composition: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          _count: {
            select: {
              batches: {
                where: {
                  status: "VALID",
                  expiryDate: { gt: new Date() },
                  remainingQuantity: { gt: 0 },
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
      prisma.medicine.count({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { genericName: { contains: query, mode: "insensitive" } },
            { composition: { contains: query, mode: "insensitive" } },
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
    console.error("Search medicines error:", error);
    return {
      success: false,
      error: error.message || "Failed to search medicines",
    };
  }
};

/**
 * Get user's scan history
 */
export const getScanHistory = async (
  userId: string,
  page: number = 1,
  limit: number = 20,
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
        orderBy: { createdAt: "desc" },
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
    console.error("Get scan history error:", error);
    return {
      success: false,
      error: error.message || "Failed to get scan history",
    };
  }
};
