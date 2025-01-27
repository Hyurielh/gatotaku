import { QueryClient } from 'react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        if (error?.status === 404) return false;
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5000,
      cacheTime: 1000 * 60 * 60, // 1 hour
      onError: (error) => {
        console.error('React Query Error:', error);
      },
    },
    mutations: {
      onError: (error) => {
        console.error('React Query Mutation Error:', error);
      },
    },
  },
});

export default queryClient;