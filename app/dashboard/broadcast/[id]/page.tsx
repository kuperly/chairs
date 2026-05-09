'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ShoppingBag,
  MessageSquare,
  Loader2,
  Eye,
  DollarSign,
  Square,
} from 'lucide-react';
import { LiveChat } from '@/components/chat/LiveChat';
import { useEvent } from '@/hooks/useEvents';
import { useViewerCount } from '@/hooks/useViewerTracking';
import { toast } from 'sonner';

// Dynamically import BroadcasterVideo with SSR disabled (Agora SDK needs browser APIs)
const BroadcasterVideo = dynamic(
  () => import('@/components/video/BroadcasterVideo').then(mod => ({ default: mod.BroadcasterVideo })),
  {
    ssr: false,
    loading: () => (
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
      </div>
    ),
  }
);

export default function BroadcastControlPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const { event, loading, refetch } = useEvent(eventId);
  const currentViewers = useViewerCount(eventId);

  const [ending, setEnding] = useState(false);

  // Mock analytics (TODO: Replace with real analytics)
  const [analytics] = useState({
    peakViewers: 245,
    totalViews: 1420,
    chatMessages: 89,
    productClicks: 34,
    orders: 12,
    revenue: 3589.88,
  });

  // Protect route - only allow access if event is LIVE
  useEffect(() => {
    if (!loading && event) {
      if (event.status !== 'live') {
        toast.error('This event is not live. You can only access the broadcast control panel for live events.');
        router.push('/dashboard/events');
      }
    }
  }, [event, loading, router]);

  const handleEndBroadcast = async () => {
    if (!confirm('Are you sure you want to end this broadcast?')) {
      return;
    }

    setEnding(true);
    try {
      const response = await fetch(`/api/events/${eventId}/broadcast/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to end broadcast');
      }

      router.push('/dashboard/events');
    } catch (error) {
      toast.error('Failed to end broadcast');
      setEnding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading broadcast controls...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <p className="text-4xl mb-4">⚠️</p>
          <h2 className="text-xl font-bold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground mb-4">
            This event doesn't exist or has been deleted.
          </p>
          <Link href="/dashboard/events">
            <Button>Back to Events</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const featuredProducts =
    event.event_featured_products?.map((efp) => ({
      id: efp.products.id,
      name: efp.products.name,
      price: efp.products.price,
      imageUrl: efp.products.imageUrls[0],
    })) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/events">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold">{event.title}</h1>
                  <Badge className="bg-red-600 text-white animate-pulse">
                    🔴 LIVE
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Broadcaster Control Panel</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/live" target="_blank">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Customer View
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleEndBroadcast}
                disabled={ending}
              >
                {ending ? (
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Video Preview & Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Broadcaster */}
            {event.agoraChannelName && (
              <BroadcasterVideo
                channelName={event.agoraChannelName}
                eventId={eventId}
              />
            )}

            {/* Live Analytics */}
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4">Live Analytics</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Current Viewers</p>
                  <p className="text-2xl font-bold text-primary">{currentViewers}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Peak Viewers</p>
                  <p className="text-2xl font-bold">{analytics.peakViewers}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">{analytics.totalViews}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Chat Messages</p>
                  <p className="text-2xl font-bold">{analytics.chatMessages}</p>
                </div>
              </div>
            </Card>

            {/* Sales Analytics */}
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Live Sales
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Orders</p>
                  <p className="text-3xl font-bold text-green-600">{analytics.orders}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Product Clicks</p>
                  <p className="text-3xl font-bold">{analytics.productClicks}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-3xl font-bold text-green-600">
                    ${analytics.revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Featured Products */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Featured Products
                </h2>
                <Button variant="outline" size="sm">
                  Manage Products
                </Button>
              </div>

              {featuredProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No featured products for this event
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {featuredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-3 border border-border rounded-lg space-y-2"
                    >
                      <div className="aspect-square bg-muted rounded-md overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-sm text-primary font-bold">
                          ${product.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Live Chat */}
          <div className="lg:col-span-1">
            <LiveChat
              eventId={eventId}
              className="h-[800px] lg:h-[calc(100vh-8rem)] sticky top-24"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
