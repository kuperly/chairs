import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

/**
 * Hook to track and display real-time viewer count for a live event
 * Increments count on mount, decrements on unmount, and subscribes to changes
 * Use this for viewers who are watching the stream
 */
export function useViewerTracking(eventId: string | null) {
  const [viewerCount, setViewerCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    if (!eventId) return;

    let hasJoined = false;

    // Function to increment viewer count
    const joinAsViewer = async () => {
      try {
        // Call RPC function to increment viewer count atomically
        const { data, error } = await supabase.rpc('increment_viewer_count', {
          event_id: eventId,
        });

        if (error) {
          console.error('Error incrementing viewer count:', error);
          return;
        }

        hasJoined = true;
        console.log('Joined as viewer, new count:', data);
      } catch (err) {
        console.error('Failed to join as viewer:', err);
      }
    };

    // Function to decrement viewer count
    const leaveAsViewer = async () => {
      if (!hasJoined) return;

      try {
        // Call RPC function to decrement viewer count atomically
        const { data, error } = await supabase.rpc('decrement_viewer_count', {
          event_id: eventId,
        });

        if (error) {
          console.error('Error decrementing viewer count:', error);
          return;
        }

        console.log('Left as viewer, new count:', data);
      } catch (err) {
        console.error('Failed to leave as viewer:', err);
      }
    };

    // Subscribe to real-time viewer count changes
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

    // Fetch initial viewer count
    const fetchInitialCount = async () => {
      const { data, error } = await supabase
        .from('live_events')
        .select('viewerCount')
        .eq('id', eventId)
        .single();

      if (!error && data) {
        setViewerCount(data.viewerCount || 0);
      }
    };

    fetchInitialCount();
    joinAsViewer();

    // Cleanup: decrement count when component unmounts
    return () => {
      leaveAsViewer();
      channel.unsubscribe();
    };
  }, [eventId]);

  return viewerCount;
}

/**
 * Hook to observe real-time viewer count without incrementing/decrementing
 * Use this for broadcasters or dashboards that just need to display the count
 */
export function useViewerCount(eventId: string | null) {
  const [viewerCount, setViewerCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    if (!eventId) return;

    // Subscribe to real-time viewer count changes
    const channel = supabase
      .channel(`event-viewers-readonly-${eventId}`)
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

    // Fetch initial viewer count
    const fetchInitialCount = async () => {
      const { data, error } = await supabase
        .from('live_events')
        .select('viewerCount')
        .eq('id', eventId)
        .single();

      if (!error && data) {
        setViewerCount(data.viewerCount || 0);
      }
    };

    fetchInitialCount();

    // Cleanup: just unsubscribe, don't change count
    return () => {
      channel.unsubscribe();
    };
  }, [eventId]);

  return viewerCount;
}
