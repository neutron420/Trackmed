import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Cloudflare R2 configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'medicine-images';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || `https://pub-${R2_ACCOUNT_ID}.r2.dev`;

// Initialize S3 client for R2 (R2 is S3-compatible)
let s3Client: S3Client | null = null;

if (R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload image to Cloudflare R2
 */
export async function uploadImageToR2(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'batches'
): Promise<UploadResult> {
  try {
    if (!s3Client) {
      return {
        success: false,
        error: 'R2 storage not configured. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY environment variables.',
      };
    }

    // Generate unique filename
    const fileExtension = fileName.split('.').pop() || 'jpg';
    const uniqueFileName = `${folder}/${uuidv4()}.${fileExtension}`;

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: uniqueFileName,
      Body: file,
      ContentType: contentType,
      // Make it publicly accessible
      CacheControl: 'max-age=31536000', // 1 year cache
    });

    await s3Client.send(command);

    // Return public URL
    const publicUrl = `${R2_PUBLIC_URL}/${uniqueFileName}`;

    return {
      success: true,
      url: publicUrl,
    };
  } catch (error: any) {
    console.error('R2 upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload image to R2',
    };
  }
}

/**
 * Validate image file
 */
export function validateImageFile(file: Express.Multer.File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 5MB limit' };
  }

  if (!allowedTypes.includes(file.mimetype)) {
    return { valid: false, error: 'Invalid file type. Only JPG, PNG, and WebP are allowed' };
  }

  return { valid: true };
}
