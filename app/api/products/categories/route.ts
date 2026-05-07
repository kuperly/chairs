import { NextRequest } from 'next/server';
import { withErrorHandling, successResponse } from '@/lib/utils/api-wrapper';
import { supabase } from '@/lib/auth/supabase';

/**
 * GET /api/products/categories
 * Get all unique product categories
 * Public endpoint
 */
export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async (req: NextRequest) => {
  // Get distinct categories from products
  const { data: products, error } = await supabase
    .from('products')
    .select('category')
    .eq('isActive', true);

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  // Extract unique categories
  const categories = [...new Set(products?.map((p) => p.category) || [])].sort();

  return successResponse({ categories });
});
