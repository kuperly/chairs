import { NextRequest } from 'next/server';
import { withErrorHandling, successResponse, errorResponse } from '@/lib/utils/api-wrapper';
import { requireSession } from '@/lib/auth/session';
import { requirePermission } from '@/lib/permissions/check';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { supabase } from '@/lib/auth/supabase';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * POST /api/events/[id]/broadcast/end
 * End broadcasting an event
 * Requires: event.broadcast permission
 */
export const POST = withErrorHandling(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = params;
  const session = await requireSession();

  // Check permission
  await requirePermission(session.user.id, PERMISSIONS.EVENT_BROADCAST);

  // Get event
  const { data: event, error: fetchError } = await supabase
    .from('live_events')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !event) {
    return errorResponse('Event not found', 404, 'EVENT_NOT_FOUND');
  }

  // Validate event status - can only end live events
  if (event.status !== 'live') {
    return errorResponse(
      `Cannot end broadcast from ${event.status} status`,
      400,
      'INVALID_EVENT_STATUS'
    );
  }

  // Update event to purchase_window status
  // Products can be purchased for 7 days after the event ends
  const { data: updatedEvent, error } = await supabase
    .from('live_events')
    .update({
      status: 'purchase_window',
      actualEndTime: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
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
    throw new Error(`Failed to end broadcast: ${error.message}`);
  }

  // TODO: Cleanup Agora streaming here
  // For POC, we'll use mock streaming

  return successResponse(
    {
      event: updatedEvent,
      purchaseWindowEndsAt: event.purchaseWindowEndTime,
    },
    'Broadcast ended successfully. Purchase window is now active.'
  );
});
