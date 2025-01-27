import { renderHook } from '@testing-library/react-hooks'; 
import { useProducts, useCategoriesAndAnimes } from '../useProducts';
import { supabase } from '../../lib/supabase';
import { QueryClient, QueryClientProvider as ReactQueryClientProvider } from 'react-query';
import React, { ReactNode } from 'react'; 

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
  },
}));

// Create a wrapper for react-query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

  const Wrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
    <ReactQueryClientProvider client={queryClient}>
      {children}
    </ReactQueryClientProvider>
  );

  return Wrapper;
};

describe('useProducts hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch products with initial filters', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Test Product',
        price: 10,
        category_id: 'cat1',
        category_ref: { id: 'cat1', name: 'Category 1' },
      },
    ];

    (supabase.from('products').select as jest.Mock).mockReturnValue({
      eq: jest.fn().mockReturnValue({
        data: mockProducts,
        error: null,
      }),
    });

    const { result, waitFor } = renderHook(
      () => useProducts({ category: 'cat1' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => result.current.isSuccess);

    expect(supabase.from('products').select).toHaveBeenCalledWith(
      '*, category_ref(*), anime(*)'
    );
    expect(result.current.data).toEqual(mockProducts);
  });

  // Resto de las pruebas...
});

describe('useCategoriesAndAnimes hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch categories and anime in a single query', async () => {
    const mockCategories = [{ id: 'cat1', name: 'Category 1' }];
    const mockAnime = [{ id: 'anime1', name: 'Anime 1' }];

    (supabase.from as jest.Mock)
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({ data: mockCategories, error: null }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({ data: mockAnime, error: null }),
      });

    const { result, waitFor } = renderHook(() => useCategoriesAndAnimes(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => result.current.isSuccess);

    expect(result.current.data?.categories).toEqual(mockCategories);
    expect(result.current.data?.animes).toEqual(mockAnime);
  });
});
