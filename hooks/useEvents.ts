import { useState, useEffect } from 'react';
import { eventsApi } from '@/lib/api/client';

export interface LiveEvent {
  id: string;
  title: string;
  description: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  purchaseWindowEndTime: string | null;
  thumbnailUrl: string | null;
  status: 'draft' | 'scheduled' | 'live' | 'ended';
  agoraChannelName: string | null;
  actualStartTime: string | null;
  actualEndTime: string | null;
  viewerCount: number;
  createdAt: string;
  updatedAt: string;
  manufacturerId: string;
  manufacturers?: {
    id: string;
    companyName: string;
    logoUrl: string | null;
  };
  event_featured_products?: Array<{
    products: {
      id: string;
      name: string;
      imageUrls: string[];
      price: number;
      compareAtPrice: number | null;
    };
  }>;
}

export interface UseEventsOptions {
  status?: 'draft' | 'scheduled' | 'live' | 'ended';
  manufacturerId?: string;
  upcoming?: boolean;
  limit?: number;
  offset?: number;
}

export interface UseEventsResult {
  events: LiveEvent[];
  loading: boolean;
  error: Error | null;
  total: number;
  refetch: () => void;
}

/**
 * Hook to fetch events list
 */
export function useEvents(options: UseEventsOptions = {}): UseEventsResult {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await eventsApi.list(options);

      setEvents(response.data || []);
      setTotal(response.pagination?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch events'));
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [
    options.status,
    options.manufacturerId,
    options.upcoming,
    options.limit,
    options.offset,
  ]);

  return {
    events,
    loading,
    error,
    total,
    refetch: fetchEvents,
  };
}

/**
 * Hook to fetch single event
 */
export function useEvent(id: string | null) {
  const [event, setEvent] = useState<LiveEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvent = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await eventsApi.get(id);
      setEvent(response.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch event'));
      setEvent(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  return {
    event,
    loading,
    error,
    refetch: fetchEvent,
  };
}

/**
 * Hook to fetch live events only
 */
export function useLiveEvents() {
  return useEvents({ status: 'live' });
}

/**
 * Hook to fetch upcoming events
 */
export function useUpcomingEvents(limit?: number) {
  return useEvents({ upcoming: true, limit });
}
