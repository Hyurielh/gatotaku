// Simple logger utility for development vs production
const isDevelopment = import.meta.env.DEV;

export const logger = {
  error: (message: string, error?: any) => {
    if (isDevelopment) {
      console.error(message, error);
    }
    // En producción podrías enviar a un servicio de logging como Sentry
  },
  
  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(message, data);
    }
  },
  
  info: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(message, data);
    }
  }
};