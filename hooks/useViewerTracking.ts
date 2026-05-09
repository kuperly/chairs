import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';

/**
 * Server-side viewer count tracking
 * Polls Agora API via server endpoint and subscribes to database updates
 * This is more reliable than client-side tracking
 */

const SYNC_INTERVAL = 5000; // Sync every 5 seconds

/**
 * Hook for real-time viewer count with server-side sync
 * Periodically syncs from Agora and subscribes to realtime updates
 */
export function useViewerCount(eventId: string | null) {
  const [viewerCount, setViewerCount] = useState(0);
  const supabase = createClient();
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!eventId) return;

    // Function to sync viewer count from server (which queries Agora)
    const syncViewerCount = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}/sync-viewers`);
        if (response.ok) {
          const data = await response.json();
          if (data.data?.viewerCount !== undefined) {
            setViewerCount(data.data.viewerCount);
          }
        }
      } catch (error) {
        console.error('Error syncing viewer count:', error);
      }
    };

    // Subscribe to real-time database updates
    const channel = supabase
      .channel(`event-viewers-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'live_events',
          filter: `id=eq.${eventId}`,
        },
        (payload) => {
          const newCount = (payload.new as any).viewerCount || 0;
          setViewerCount(newCount);
        }
      )
      .subscribe();

    // Initial sync
    syncViewerCount();

    // Set up periodic sync
    syncIntervalRef.current = setInterval(syncViewerCount, SYNC_INTERVAL);

    // Cleanup
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      channel.unsubscribe();
    };
  }, [eventId]);

  return viewerCount;
}

/**
 * Alias for backwards compatibility
 * @deprecated Use useViewerCount instead
 */
export function useViewerTracking(eventId: string | null) {
  return useViewerCount(eventId);
}
