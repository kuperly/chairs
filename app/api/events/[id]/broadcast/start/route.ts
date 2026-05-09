import { NextRequest } from 'next/server';
import { withErrorHandling, successResponse, errorResponse } from '@/lib/utils/api-wrapper';
import { requireSession } from '@/lib/auth/session';
import { requirePermission } from '@/lib/permissions/check';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { startBroadcastSchema } from '@/lib/validation/event';
import { createClient } from '@/utils/supabase/server';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * POST /api/events/[id]/broadcast/start
 * Start broadcasting an event
 * Requires: event.broadcast permission
 */
export const dynamic = 'force-dynamic';

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

  // Validate event status - can only start draft, scheduled, or ended events (allow restarting)
  if (!['draft', 'scheduled', 'ended'].includes(event.status)) {
    return errorResponse(
      `Cannot start broadcast from ${event.status} status`,
      400,
      'INVALID_EVENT_STATUS'
    );
  }

  // Validate time window - can only start within scheduled time range
  const now = new Date();
  const scheduledStart = new Date(event.scheduledStartTime);
  const scheduledEnd = new Date(event.scheduledEndTime);
  const oneHourBefore = new Date(scheduledStart.getTime() - 60 * 60 * 1000);

  if (now < oneHourBefore) {
    return errorResponse(
      `Event can only be started 1 hour before scheduled start time (${scheduledStart.toLocaleString()})`,
      400,
      'TOO_EARLY'
    );
  }

  if (now > scheduledEnd) {
    return errorResponse(
      `Event scheduled time has ended (${scheduledEnd.toLocaleString()})`,
      400,
      'TOO_LATE'
    );
  }

  // Parse request body
  const body = await req.json();
  const validatedData = startBroadcastSchema.parse(body);

  // Generate Agora channel name if not provided
  const channelName =
    validatedData.agoraChannelName || `event_${id}_${Date.now()}`;

  // Update event to live status
  const { data: updatedEvent, error } = await supabase
    .from('live_events')
    .update({
      status: 'live',
      agoraChannelName: channelName,
      actualStartTime: new Date().toISOString(),
      viewerCount: 0, // Reset viewer count when starting broadcast
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
    throw new Error(`Failed to start broadcast: ${error.message}`);
  }

  // TODO: Initialize Agora streaming here
  // For POC, we'll use mock streaming

  return successResponse(
    {
      event: updatedEvent,
      channelName,
      // TODO: Return Agora token here
    },
    'Broadcast started successfully'
  );
});
