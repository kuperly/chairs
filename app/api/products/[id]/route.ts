import { NextRequest } from 'next/server';
import { withErrorHandling, successResponse, errorResponse } from '@/lib/utils/api-wrapper';
import { requireSession } from '@/lib/auth/session';
import { requirePermission, hasPermission } from '@/lib/permissions/check';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { updateProductSchema } from '@/lib/validation/product';
import { supabase } from '@/lib/auth/supabase';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/products/[id]
 * Get a single product by ID
 * Public endpoint
 */
export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = params;

  const { data: product, error } = await supabase
    .from('products')
    .select('*, manufacturers(id, companyName, logoUrl, description)')
    .eq('id', id)
    .single();

  if (error || !product) {
    return errorResponse('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  return successResponse(product);
});

/**
 * PUT /api/products/[id]
 * Update a product
 * Requires: product.update OR product.update.own (if own product)
 */
export const PUT = withErrorHandling(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = params;
  const session = await requireSession();

  // Get existing product
  const { data: existingProduct, error: fetchError } = await supabase
    .from('products')
    .select('*, manufacturers(id)')
    .eq('id', id)
    .single();

  if (fetchError || !existingProduct) {
    return errorResponse('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  // Check permissions
  const canUpdateAny = await hasPermission(session.user.id, PERMISSIONS.PRODUCT_UPDATE);
  const canUpdateOwn = await hasPermission(session.user.id, PERMISSIONS.PRODUCT_UPDATE_OWN);

  // If user can only update own, verify ownership
  if (!canUpdateAny && canUpdateOwn) {
    // Check if user's manufacturer matches product's manufacturer
    const { data: user } = await supabase
      .from('users')
      .select('manufacturerId')
      .eq('id', session.user.id)
      .single();

    if (user?.manufacturerId !== existingProduct.manufacturerId) {
      return errorResponse(
        'You can only update your own products',
        403,
        'PERMISSION_DENIED'
      );
    }
  } else if (!canUpdateAny) {
    return errorResponse('Permission denied', 403, 'PERMISSION_DENIED');
  }

  // Parse and validate update data
  const body = await req.json();
  const validatedData = updateProductSchema.parse(body);

  // Update product
  const { data: product, error } = await supabase
    .from('products')
    .update({
      ...(validatedData.name && { name: validatedData.name }),
      ...(validatedData.description && { description: validatedData.description }),
      ...(validatedData.price !== undefined && { price: validatedData.price }),
      ...(validatedData.compareAtPrice !== undefined && {
        compareAtPrice: validatedData.compareAtPrice,
      }),
      ...(validatedData.category && { category: validatedData.category }),
      ...(validatedData.stockQuantity !== undefined && {
        stockQuantity: validatedData.stockQuantity,
      }),
      ...(validatedData.imageUrls && { imageUrls: validatedData.imageUrls }),
      ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
      updatedAt: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*, manufacturers(id, companyName, logoUrl)')
    .single();

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }

  return successResponse(product, 'Product updated successfully');
});

/**
 * DELETE /api/products/[id]
 * Delete a product
 * Requires: product.delete permission
 */
export const DELETE = withErrorHandling(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = params;
  const session = await requireSession();

  // Check permission
  await requirePermission(session.user.id, PERMISSIONS.PRODUCT_DELETE);

  // Check if product exists
  const { data: existingProduct, error: fetchError } = await supabase
    .from('products')
    .select('id')
    .eq('id', id)
    .single();

  if (fetchError || !existingProduct) {
    return errorResponse('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  // Soft delete - just mark as inactive
  const { error } = await supabase
    .from('products')
    .update({ isActive: false, updatedAt: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`);
  }

  return successResponse({ deleted: true }, 'Product deleted successfully');
});
