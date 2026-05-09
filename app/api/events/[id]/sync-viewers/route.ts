import { NextRequest } from 'next/server';
import { withErrorHandling, successResponse, errorResponse } from '@/lib/utils/api-wrapper';
import { createClient } from '@/utils/supabase/server';
import { syncViewerCount } from '@/lib/agora/channel-query';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/events/[id]/sync-viewers
 * Sync viewer count from Agora and update database
 * Public endpoint - used by viewer pages for real-time updates
 */
export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = params;

  // Get event
  const supabase = await createClient();
  const { data: event, error: fetchError } = await supabase
    .from('live_events')
    .select('id, agoraChannelName, status')
    .eq('id', id)
    .single();

  if (fetchError || !event) {
    return errorResponse('Event not found', 404, 'EVENT_NOT_FOUND');
  }

  // Only sync for live events
  if (event.status !== 'live') {
    return successResponse({ viewerCount: 0 }, 'Event is not live');
  }

  // Check if channel name exists
  if (!event.agoraChannelName) {
    return successResponse({ viewerCount: 0 }, 'No channel name');
  }

  // Sync viewer count from Agora
  const viewerCount = await syncViewerCount(id, event.agoraChannelName);

  return successResponse({ viewerCount }, 'Viewer count synced');
});
