
export function generateWebPSrcset(images: string[]): string[] {
  const sizes = [400, 800, 1200];
  
  return images.map(src => {
    return sizes.map(size => {
      return `${src} ${size}w`;
    }).join(', ');
  });
}

export function convertToWebP(src: string): string {
  if (src.toLowerCase().endsWith('.webp')) {
    return src;
  }

  return src;
}

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

export function generateLowResPlaceholder(src: string): string {
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
  const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];

  const validUrls = urls.filter(url => url && url.trim() !== '');

  return validUrls.map(url => {
    try {
      const sizes = [
        { descriptor: '320w', width: 320 },
        { descriptor: '640w', width: 640 },
        { descriptor: '1024w', width: 1024 },
        { descriptor: '1920w', width: 1920 }
      ];

      return sizes.map(size => {
        return `${url} ${size.descriptor}`;
      }).join(', ');
    } catch{
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
        
        const compressedDataUrl = canvas.toDataURL('image/webp', 0.7);
        
        fetch(compressedDataUrl)
          .then(res => res.blob())
          .then(blob => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/webp',
              lastModified: Date.now()
            });
            
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
