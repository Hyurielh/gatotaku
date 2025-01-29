import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        if (error?.status === 404) return false;
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60, // 1 hour
    },
    mutations: {
      // Configuración de mutaciones sin onError
    },
  },
});

// Manejo global de errores
queryClient.setDefaultOptions({
  queries: {
    // Puedes agregar un error handler global si es necesario
    // Por ejemplo, para logging o notificaciones
  },
});

export default queryClient;