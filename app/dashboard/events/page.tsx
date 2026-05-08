'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Square, Edit, Trash2, Loader2 } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';

export default function EventsPage() {
  const router = useRouter();
  const { events: eventsRaw, loading, refetch } = useEvents({ limit: 100 });
  const [startingEventId, setStartingEventId] = useState<string | null>(null);
  const [endingEventId, setEndingEventId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Ensure events is always an array
  const events = Array.isArray(eventsRaw) ? eventsRaw : [];

  const handleStartBroadcast = async (eventId: string) => {
    setError(null);
    setStartingEventId(eventId);

    try {
      const response = await fetch(`/api/events/${eventId}/broadcast/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to start broadcast');
      }

      // Refresh events list
      await refetch();

      // Redirect to broadcaster control panel
      router.push(`/dashboard/broadcast/${eventId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setStartingEventId(null);
    }
  };

  const handleEndBroadcast = async (eventId: string) => {
    setError(null);
    setEndingEventId(eventId);

    try {
      const response = await fetch(`/api/events/${eventId}/broadcast/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to end broadcast');
      }

      // Refresh events list
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setEndingEventId(null);
    }
  };

  const getStatusBadge = (status: string, purchaseWindowEndTime: string | null) => {
    const now = new Date();
    const windowEnd = purchaseWindowEndTime ? new Date(purchaseWindowEndTime) : null;
    const canPurchase = windowEnd && now < windowEnd;

    switch (status) {
      case 'live':
        return <Badge className="bg-red-600 text-white animate-pulse">🔴 LIVE</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-600">Scheduled</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'ended':
        if (canPurchase) {
          return (
            <div className="flex items-center gap-2">
              <Badge className="bg-gray-600">Ended</Badge>
              <Badge className="bg-green-600">Purchases Open</Badge>
            </div>
          );
        }
        return <Badge className="bg-gray-600">Ended</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Manage Events</h1>
            </div>
            <Link href="/dashboard/events/create">
              <Button className="bg-primary hover:bg-primary/90">
                Create Event
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">
            {error}
          </div>
        )}

        {/* Events List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-bold mb-2">No Events Yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first live event to get started
            </p>
            <Link href="/dashboard/events/create">
              <Button className="bg-primary hover:bg-primary/90">
                Create Event
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const now = new Date();
              const scheduledStart = new Date(event.scheduledStartTime);
              const scheduledEnd = new Date(event.scheduledEndTime);
              const isStarting = startingEventId === event.id;
              const isEnding = endingEventId === event.id;

              // Can only start if:
              // 1. Status is draft, scheduled, or ended (allow restarting ended events)
              // 2. Current time is within scheduled window (or close to it, e.g., 1 hour before)
              const oneHourBefore = new Date(scheduledStart.getTime() - 60 * 60 * 1000);
              const canStartByStatus = ['draft', 'scheduled', 'ended'].includes(event.status);
              const canStartByTime = now >= oneHourBefore && now <= scheduledEnd;
              const canStart = canStartByStatus && canStartByTime;

              // Can only end if:
              // 1. Status is live
              // 2. Current time is before scheduled end (or shortly after for grace period)
              const oneHourAfter = new Date(scheduledEnd.getTime() + 60 * 60 * 1000);
              const canEnd = event.status === 'live' && now <= oneHourAfter;

              return (
                <Card key={event.id} className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Thumbnail */}
                    {event.thumbnailUrl && (
                      <div className="w-32 h-32 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                        <img
                          src={event.thumbnailUrl}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Event Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold">{event.title}</h3>
                            {getStatusBadge(event.status, event.purchaseWindowEndTime)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {event.description}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Manufacturer: </span>
                              <span className="font-medium">
                                {event.manufacturers?.companyName || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Scheduled: </span>
                              <span className="font-medium">
                                {scheduledStart.toLocaleDateString()} at{' '}
                                {scheduledStart.toLocaleTimeString()}
                              </span>
                            </div>
                            {canStartByStatus && !canStartByTime && (
                              <div>
                                <Badge variant="outline" className="text-yellow-600">
                                  {now < oneHourBefore
                                    ? `Available ${Math.ceil((oneHourBefore.getTime() - now.getTime()) / (1000 * 60))}min before start`
                                    : 'Event time has passed'}
                                </Badge>
                              </div>
                            )}
                            {event.status === 'live' && (
                              <div>
                                <span className="text-muted-foreground">Viewers: </span>
                                <span className="font-medium">{event.viewerCount || 0}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {canStart && (
                            <Button
                              size="sm"
                              onClick={() => handleStartBroadcast(event.id)}
                              disabled={isStarting}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              {isStarting ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Starting...
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Go Live
                                </>
                              )}
                            </Button>
                          )}

                          {canEnd && (
                            <>
                              <Link href={`/dashboard/broadcast/${event.id}`}>
                                <Button
                                  size="sm"
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  <Play className="w-4 h-4 mr-2" />
                                  Enter Broadcast
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEndBroadcast(event.id)}
                                disabled={isEnding}
                              >
                                {isEnding ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Ending...
                                  </>
                                ) : (
                                  <>
                                    <Square className="w-4 h-4 mr-2" />
                                    End Broadcast
                                  </>
                                )}
                              </Button>
                            </>
                          )}

                          {(event.status === 'draft' || event.status === 'scheduled') && (
                            <>
                              <Link href={`/dashboard/events/edit/${event.id}`}>
                                <Button size="sm" variant="outline">
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </Button>
                              </Link>
                              {event.status === 'draft' && (
                                <Button size="sm" variant="outline">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
