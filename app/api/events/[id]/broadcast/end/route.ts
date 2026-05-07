import { NextRequest } from 'next/server';
import { withErrorHandling, successResponse, errorResponse } from '@/lib/utils/api-wrapper';
import { requireSession } from '@/lib/auth/session';
import { requirePermission } from '@/lib/permissions/check';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { createClient } from '@/utils/supabase/server';

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

  // Create Supabase client
  const supabase = await createClient();

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

  // Optional: Validate time window - give grace period of 1 hour after scheduled end
  const now = new Date();
  const scheduledEnd = new Date(event.scheduledEndTime);
  const oneHourAfter = new Date(scheduledEnd.getTime() + 60 * 60 * 1000);

  if (now > oneHourAfter) {
    // Still allow ending, but it's past the grace period
    console.warn(`Ending broadcast past grace period for event ${event.id}`);
  }

  // Update event to ended status
  // Products remain purchasable until purchaseWindowEndTime
  const { data: updatedEvent, error } = await supabase
    .from('live_events')
    .update({
      status: 'ended',
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
