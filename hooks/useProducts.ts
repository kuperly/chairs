import { useState, useEffect } from 'react';
import { productsApi } from '@/lib/api/client';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  imageUrls: string[];
  stockQuantity: number;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  manufacturerId: string;
  manufacturers?: {
    id: string;
    companyName: string;
    logoUrl: string | null;
  };
}

export interface UseProductsOptions {
  category?: string;
  manufacturerId?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: Error | null;
  total: number;
  refetch: () => void;
}

/**
 * Hook to fetch products list
 */
export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productsApi.list(options);

      setProducts(response.data || []);
      setTotal(response.pagination?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch products'));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [
    options.category,
    options.manufacturerId,
    options.isActive,
    options.minPrice,
    options.maxPrice,
    options.search,
    options.limit,
    options.offset,
  ]);

  return {
    products,
    loading,
    error,
    total,
    refetch: fetchProducts,
  };
}

/**
 * Hook to fetch single product
 */
export function useProduct(id: string | null) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProduct = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await productsApi.get(id);
      setProduct(response.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch product'));
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  return {
    product,
    loading,
    error,
    refetch: fetchProduct,
  };
}

/**
 * Hook to fetch product categories
 */
export function useProductCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await productsApi.categories();
        setCategories(response.data?.categories || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch categories'));
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}
