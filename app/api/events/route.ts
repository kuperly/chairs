import { NextRequest } from 'next/server';
import { withErrorHandling, successResponse, errorResponse } from '@/lib/utils/api-wrapper';
import { requireSession } from '@/lib/auth/session';
import { requirePermission } from '@/lib/permissions/check';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { createEventSchema, listEventsQuerySchema } from '@/lib/validation/event';
import { supabase } from '@/lib/auth/supabase';

/**
 * GET /api/events
 * List events with optional filtering
 * Public endpoint (no auth required)
 */
export const GET = withErrorHandling(async (req: NextRequest) => {
  // Parse query parameters
  const searchParams = Object.fromEntries(req.nextUrl.searchParams);
  const query = listEventsQuerySchema.parse(searchParams);

  // Build Supabase query
  let supabaseQuery = supabase
    .from('live_events')
    .select(
      `
      *,
      manufacturers(id, companyName, logoUrl),
      event_featured_products(
        products(id, name, imageUrls, price, compareAtPrice)
      )
    `,
      { count: 'exact' }
    );

  // Apply filters
  if (query.status) {
    supabaseQuery = supabaseQuery.eq('status', query.status);
  }

  if (query.manufacturerId) {
    supabaseQuery = supabaseQuery.eq('manufacturerId', query.manufacturerId);
  }

  if (query.upcoming === 'true') {
    const now = new Date().toISOString();
    supabaseQuery = supabaseQuery
      .gte('scheduledStartTime', now)
      .in('status', ['draft', 'scheduled']);
  }

  // Apply pagination
  const limit = query.limit ? parseInt(query.limit) : 20;
  const offset = query.offset ? parseInt(query.offset) : 0;
  supabaseQuery = supabaseQuery.range(offset, offset + limit - 1);

  // Order by scheduled start time
  supabaseQuery = supabaseQuery.order('scheduledStartTime', { ascending: true });

  const { data: events, error, count } = await supabaseQuery;

  if (error) {
    throw new Error(`Failed to fetch events: ${error.message}`);
  }

  return successResponse({
    events,
    pagination: {
      total: count || 0,
      limit,
      offset,
    },
  });
});

/**
 * POST /api/events
 * Create a new event
 * Requires: event.create permission
 */
export const POST = withErrorHandling(async (req: NextRequest) => {
  // Require authentication
  const session = await requireSession();

  // Check permission
  await requirePermission(session.user.id, PERMISSIONS.EVENT_CREATE);

  // Parse and validate request body
  const body = await req.json();
  const validatedData = createEventSchema.parse(body);

  // Verify manufacturer exists
  const { data: manufacturer, error: mfgError } = await supabase
    .from('manufacturers')
    .select('id')
    .eq('id', validatedData.manufacturerId)
    .single();

  if (mfgError || !manufacturer) {
    return errorResponse('Manufacturer not found', 404, 'MANUFACTURER_NOT_FOUND');
  }

  // Verify all featured products exist and belong to the manufacturer
  if (validatedData.featuredProductIds.length > 0) {
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id')
      .in('id', validatedData.featuredProductIds)
      .eq('manufacturerId', validatedData.manufacturerId);

    if (prodError || products.length !== validatedData.featuredProductIds.length) {
      return errorResponse(
        'Some featured products not found or do not belong to this manufacturer',
        400,
        'INVALID_PRODUCTS'
      );
    }
  }

  // Calculate purchase window end time (7 days after scheduled end)
  const scheduledEnd = new Date(validatedData.scheduledEndTime);
  const purchaseWindowEnd = new Date(scheduledEnd);
  purchaseWindowEnd.setDate(purchaseWindowEnd.getDate() + 7);

  // Create event
  const { data: event, error } = await supabase
    .from('live_events')
    .insert({
      title: validatedData.title,
      description: validatedData.description,
      scheduledStartTime: validatedData.scheduledStartTime,
      scheduledEndTime: validatedData.scheduledEndTime,
      purchaseWindowEndTime: purchaseWindowEnd.toISOString(),
      thumbnailUrl: validatedData.thumbnailUrl,
      manufacturerId: validatedData.manufacturerId,
      status: 'draft',
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create event: ${error.message}`);
  }

  // Add featured products if provided
  if (validatedData.featuredProductIds.length > 0) {
    const featuredProductsData = validatedData.featuredProductIds.map((productId) => ({
      eventId: event.id,
      productId,
    }));

    const { error: featuredError } = await supabase
      .from('event_featured_products')
      .insert(featuredProductsData);

    if (featuredError) {
      // Rollback event creation if featured products fail
      await supabase.from('live_events').delete().eq('id', event.id);
      throw new Error(`Failed to add featured products: ${featuredError.message}`);
    }
  }

  // Fetch complete event with relations
  const { data: completeEvent } = await supabase
    .from('live_events')
    .select(
      `
      *,
      manufacturers(id, companyName, logoUrl),
      event_featured_products(
        products(id, name, imageUrls, price, compareAtPrice)
      )
    `
    )
    .eq('id', event.id)
    .single();

  return successResponse(completeEvent, 'Event created successfully');
});
