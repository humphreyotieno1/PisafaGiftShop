/**
 * Utility functions for optimizing image loading and processing
 */

/**
 * Compresses and resizes an image before upload
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width of the image
 * @param {number} maxHeight - Maximum height of the image
 * @param {number} quality - Image quality (0-1)
 * @returns {Promise<string>} - Base64 data URL of the compressed image
 */
export function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to WebP if supported
        const format = 'image/jpeg';
        const base64 = canvas.toDataURL(format, quality);
        resolve(base64);
      };
      
      img.onerror = (error) => {
        reject(error);
      };
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
  });
}

/**
 * Validates an image file
 * @param {File} file - The image file to validate
 * @param {Array<string>} allowedTypes - Array of allowed MIME types
 * @param {number} maxSizeInMB - Maximum file size in MB
 * @returns {Object} - { valid: boolean, error: string }
 */
export function validateImage(file, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'], maxSizeInMB = 1) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `Invalid file type. Allowed types: ${allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}` 
    };
  }
  
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return { 
      valid: false, 
      error: `File size too large. Maximum size is ${maxSizeInMB}MB.` 
    };
  }
  
  return { valid: true, error: null };
}

/**
 * Optimizes image loading with lazy loading and blur placeholder
 * @param {Object} props - Image properties
 * @returns {Object} - Image attributes for the img tag
 */
export function optimizeImageLoading(props) {
  const { src, alt, className, width, height } = props;
  
  if (!src) {
    return {
      src: '/placeholder.png',
      alt: alt || 'Placeholder image',
      className,
      width: width || 'auto',
      height: height || 'auto',
      loading: 'lazy',
      decoding: 'async',
    };
  }
  
  return {
    src,
    alt: alt || 'Image',
    className,
    width: width || 'auto',
    height: height || 'auto',
    loading: 'lazy',
    decoding: 'async',
  };
}
