const isDevelopment = !!(((import.meta as unknown) as { env?: { DEV?: boolean } }).env?.DEV);

export const logger = {
  error: (message: string, error?: unknown) => {
    if (isDevelopment) {
      console.error(message, error);
    }
  },
  
  warn: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.warn(message, data);
    }
  },
  
  info: (message: string, data?: unknown) => {
    if (isDevelopment) {
      console.log(message, data);
    }
  }
};