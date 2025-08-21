/**
 * Simple image optimization utilities
 */

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  width?: number;
  height?: number;
  size?: number;
}

export interface CompressOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  maxSize?: number; // in bytes
}

/**
 * Validate image file
 */
export function validateImage(file: File): Promise<ImageValidationResult> {
  return new Promise((resolve) => {
    if (!file) {
      resolve({ isValid: false, error: 'No file provided' });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      resolve({ isValid: false, error: 'File must be an image' });
      return;
    }

    // Check file size (default 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      resolve({ isValid: false, error: 'File size must be less than 5MB' });
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        isValid: true,
        width: img.width,
        height: img.height,
        size: file.size,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ isValid: false, error: 'Invalid image file' });
    };

    img.src = url;
  });
}

/**
 * Compress image using canvas
 */
export function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  return new Promise((resolve, reject) => {
    const {
      quality = 0.8,
      maxWidth = 1920,
      maxHeight = 1080,
    } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Get image dimensions
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Convert file to base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
} 