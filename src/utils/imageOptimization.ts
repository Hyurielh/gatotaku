// Browser-compatible image optimization utilities

// Función para generar srcset para diferentes tamaños de imagen
export function generateWebPSrcset(images: string[]): string[] {
  const sizes = [400, 800, 1200];
  
  return images.map(src => {
    return sizes.map(size => {
      // Devolver el mismo src para todos los tamaños
      return `${src} ${size}w`;
    }).join(', ');
  });
}

// Función para manejar conversión de WebP
export function convertToWebP(src: string): string {
  // Si ya es WebP, devolverlo
  if (src.toLowerCase().endsWith('.webp')) {
    return src;
  }

  // Si no es WebP, devolver la imagen original
  return src;
}

// Función para optimizar imágenes
export function optimizeImage(
  src: string, 
  options: { 
    maxWidth?: number, 
    quality?: number, 
    format?: 'webp' | 'jpeg' | 'png' 
  } = {}
): string {
  const {
    maxWidth = 1200,
    quality = 70,
    format = 'webp'
  } = options;

  // Construcción de URL de Imagekit con parámetros de optimización
  // Ejemplo: https://ik.imagekit.io/tu_id/imagen.jpg?tr=w-1200,q-70,fo-auto,cmpr-true,f-webp
  let url = src;
  const params = [
    `w-${maxWidth}`,
    `q-${quality}`,
    'fo-auto',
    'cmpr-true',
    `f-${format}`
  ];
  if (src.includes('?')) {
    url += `&tr=${params.join(',')}`;
  } else {
    url += `?tr=${params.join(',')}`;
  }
  return url;
}

// Función para generar placeholder de baja resolución
export function generateLowResPlaceholder(src: string): string {
  // En un escenario real, generarías un placeholder de baja resolución
  // Podrías usar técnicas como:
  // - Base64 encoding de una versión muy pequeña de la imagen
  // - Generar un color promedio
  return `data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' viewBox%3D'0 0 1 1'%3E%3Cfilter id%3D'blur' filterUnits%3D'userSpaceOnUse' color-interpolation-filters%3D'sRGB'%3E%3CfeGaussianBlur stdDeviation%3D'10'%2F%3E%3C%2Ffilter%3E%3Cimage x%3D'0' y%3D'0' width%3D'100%25' height%3D'100%25' preserveAspectRatio%3D'none' href%3D'${src}' filter%3D'url(%23blur)'%2F%3E%3C%2Fsvg%3E`;
}

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

export function generateWebPSrcsetOld(imageUrls: string | string[]): string[] {
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
