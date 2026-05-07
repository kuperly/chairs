import { NextRequest } from 'next/server';
import { withErrorHandling, successResponse, errorResponse } from '@/lib/utils/api-wrapper';
import { requireSession } from '@/lib/auth/session';
import { requirePermission } from '@/lib/permissions/check';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { updateEventSchema } from '@/lib/validation/event';
import { createClient } from '@/utils/supabase/server';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/events/[id]
 * Get a single event by ID
 * Public endpoint
 */
export const GET = withErrorHandling(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = params;

  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from('live_events')
    .select(
      `
      *,
      manufacturers(id, companyName, logoUrl, description),
      event_featured_products(
        products(id, name, description, imageUrls, price, compareAtPrice, category, stockQuantity)
      )
    `
    )
    .eq('id', id)
    .single();

  if (error || !event) {
    return errorResponse('Event not found', 404, 'EVENT_NOT_FOUND');
  }

  return successResponse(event);
});

/**
 * PUT /api/events/[id]
 * Update an event
 * Requires: event.update permission
 */
export const PUT = withErrorHandling(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = params;
  const session = await requireSession();

  // Check permission
  await requirePermission(session.user.id, PERMISSIONS.EVENT_UPDATE);

  const supabase = await createClient();

  // Get existing event
  const { data: existingEvent, error: fetchError } = await supabase
    .from('live_events')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !existingEvent) {
    return errorResponse('Event not found', 404, 'EVENT_NOT_FOUND');
  }

  // Parse and validate update data
  const body = await req.json();
  const validatedData = updateEventSchema.parse(body);

  // If updating featured products, verify they exist
  if (validatedData.featuredProductIds) {
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id')
      .in('id', validatedData.featuredProductIds)
      .eq('manufacturerId', existingEvent.manufacturerId);

    if (prodError || products.length !== validatedData.featuredProductIds.length) {
      return errorResponse(
        'Some featured products not found or do not belong to this manufacturer',
        400,
        'INVALID_PRODUCTS'
      );
    }

    // Update featured products junction table
    // First, delete existing associations
    await supabase.from('event_featured_products').delete().eq('eventId', id);

    // Then add new associations
    if (validatedData.featuredProductIds.length > 0) {
      const featuredProductsData = validatedData.featuredProductIds.map((productId) => ({
        eventId: id,
        productId,
      }));

      const { error: featuredError } = await supabase
        .from('event_featured_products')
        .insert(featuredProductsData);

      if (featuredError) {
        throw new Error(`Failed to update featured products: ${featuredError.message}`);
      }
    }
  }

  // Update event
  const updateData: any = {
    updatedAt: new Date().toISOString(),
  };

  if (validatedData.title) updateData.title = validatedData.title;
  if (validatedData.description) updateData.description = validatedData.description;
  if (validatedData.scheduledStartTime)
    updateData.scheduledStartTime = validatedData.scheduledStartTime;
  if (validatedData.scheduledEndTime)
    updateData.scheduledEndTime = validatedData.scheduledEndTime;
  if (validatedData.thumbnailUrl !== undefined)
    updateData.thumbnailUrl = validatedData.thumbnailUrl;
  if (validatedData.status) updateData.status = validatedData.status;

  const { data: event, error } = await supabase
    .from('live_events')
    .update(updateData)
    .eq('id', id)
    .select(
      `
      *,
      manufacturers(id, companyName, logoUrl),
      event_featured_products(
        products(id, name, imageUrls, price, compareAtPrice)
      )
    `
    )
    .single();

  if (error) {
    throw new Error(`Failed to update event: ${error.message}`);
  }

  return successResponse(event, 'Event updated successfully');
});

/**
 * DELETE /api/events/[id]
 * Delete an event
 * Requires: event.delete permission
 */
export const DELETE = withErrorHandling(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = params;
  const session = await requireSession();

  // Check permission
  await requirePermission(session.user.id, PERMISSIONS.EVENT_DELETE);

  const supabase = await createClient();

  // Check if event exists
  const { data: existingEvent, error: fetchError } = await supabase
    .from('live_events')
    .select('id, status')
    .eq('id', id)
    .single();

  if (fetchError || !existingEvent) {
    return errorResponse('Event not found', 404, 'EVENT_NOT_FOUND');
  }

  // Only allow deletion of draft events
  if (existingEvent.status !== 'draft') {
    return errorResponse(
      'Only draft events can be deleted',
      400,
      'INVALID_EVENT_STATUS'
    );
  }

  // Delete event (cascade will handle featured products)
  const { error } = await supabase.from('live_events').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete event: ${error.message}`);
  }

  return successResponse({ deleted: true }, 'Event deleted successfully');
});
