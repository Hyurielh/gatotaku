// Browser-compatible image optimization utilities

export async function convertImageToWebP(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not create canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        
        // Convert to WebP with 80% quality
        const webpDataUrl = canvas.toDataURL('image/webp', 0.8);
        resolve(webpDataUrl);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = event.target?.result as string;
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
}

export function generateWebPSrcset(imageUrls: string | string[]): string[] {
  // Normalize input to an array
  const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];

  // Filter out invalid or empty URLs
  const validUrls = urls.filter(url => url && url.trim() !== '');

  // Generate srcset for each URL with multiple sizes
  return validUrls.map(url => {
    try {
      // Create multiple size descriptors for responsive images
      const sizes = [
        { descriptor: '320w', width: 320 },
        { descriptor: '640w', width: 640 },
        { descriptor: '1024w', width: 1024 },
        { descriptor: '1920w', width: 1920 }
      ];

      return sizes.map(size => {
        // In a real-world scenario, you'd generate actual resized images
        // For now, we'll use the original URL with different width descriptors
        return `${url} ${size.descriptor}`;
      }).join(', ');
    } catch (error) {
      console.error('Error generating WebP srcset:', error);
      return url;
    }
  });
}

export function compressImage(file: File, maxSizeKB: number = 500): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not create canvas context'));
          return;
        }
        
        // Calculate the scale factor
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to WebP and compress
        const compressedDataUrl = canvas.toDataURL('image/webp', 0.7);
        
        // Convert data URL to Blob
        fetch(compressedDataUrl)
          .then(res => res.blob())
          .then(blob => {
            // Create a new File object
            const compressedFile = new File([blob], file.name, {
              type: 'image/webp',
              lastModified: Date.now()
            });
            
            // Check file size
            if (compressedFile.size > maxSizeKB * 1024) {
              reject(new Error(`File too large. Maximum size is ${maxSizeKB}KB`));
              return;
            }
            
            resolve(compressedFile);
          })
          .catch(reject);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = event.target?.result as string;
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
}
