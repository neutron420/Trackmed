/**
 * Upload image to Cloudflare R2 via backend API
 */
export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadImageToR2(
  file: File,
  folder: string = 'batches',
  token: string
): Promise<UploadResult> {
  try {
    // Validate file
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size exceeds 5MB limit',
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Only JPG, PNG, and WebP are allowed',
      };
    }

    // Create FormData
    const formData = new FormData();
    formData.append('image', file);

    // Upload to backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${apiUrl}/api/upload/image?folder=${folder}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Failed to upload image',
      };
    }

    return {
      success: true,
      url: data.data.url,
    };
  } catch (error: any) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload image',
    };
  }
}
