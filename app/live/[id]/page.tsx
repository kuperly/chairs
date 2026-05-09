'use client';

import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { Loader2, Share2, Heart } from 'lucide-react';
import { LiveChat } from '@/components/chat/LiveChat';
import { useEvent } from '@/hooks/useEvents';
import { toast } from 'sonner';

// Dynamically import ViewerVideo with SSR disabled (Agora SDK needs browser APIs)
const ViewerVideo = dynamic(
  () => import('@/components/video/ViewerVideo').then(mod => ({ default: mod.ViewerVideo })),
  {
    ssr: false,
    loading: () => (
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden border-2 border-primary/30 flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-primary animate-spin" />
      </div>
    ),
  }
);

export default function LiveEventPage({ params }: { params: { id: string } }) {
  const eventId = params.id;
  const { event: liveEvent, loading, error } = useEvent(eventId);

  // Handle share event
  const handleShare = async () => {
    if (!liveEvent) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: liveEvent.title,
          text: `Watch live: ${liveEvent.title}`,
          url: window.location.href,
        });
        toast.success('Shared successfully!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  // Handle follow factory
  const handleFollow = () => {
    if (!liveEvent?.manufacturers) return;

    // TODO: Implement actual follow functionality
    toast.success(`Following ${liveEvent.manufacturers.companyName}!`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading live event...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-2xl mb-4">⚠️</p>
          <h1 className="text-2xl font-bold text-foreground mb-2">Error Loading Live Event</h1>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // No live event state
  if (!liveEvent) {
    return (
      <div className="min-h-screen bg-background">
        <Header />

        {/* No Live Event */}
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto p-12 text-center">
            <div className="text-6xl mb-6">📺</div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              No Live Events Right Now
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              There are no live factory tours happening at the moment. Check back soon or browse our product catalog!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  View Upcoming Events
                </Button>
              </Link>
              <Link href="/shop">
                <Button size="lg" variant="outline">
                  Browse Products
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Extract featured products
  const featuredProducts = liveEvent.event_featured_products?.map((efp) => ({
    id: efp.products.id,
    name: efp.products.name,
    price: efp.products.price,
    compareAtPrice: efp.products.compareAtPrice,
    imageUrl: efp.products.imageUrls[0] || 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=300&q=80',
  })) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Video + Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            {liveEvent.agoraChannelName && (
              <ViewerVideo
                channelName={liveEvent.agoraChannelName}
                viewerCount={liveEvent.viewerCount}
              />
            )}

            {/* Event Info */}
            <div className="space-y-4">
              <div>
                <Badge className="mb-2 text-xs">
                  {liveEvent.manufacturers?.companyName || 'FACTORY'}
                </Badge>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  {liveEvent.title}
                </h1>
                <p className="text-lg text-muted-foreground mb-1">
                  {liveEvent.description}
                </p>
                <p className="text-sm text-muted-foreground">
                  Live factory tour and product showcase
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleShare} className="bg-primary hover:bg-primary/90 text-black font-bold">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  Share Event
                </Button>
                <Button onClick={handleFollow} variant="outline" className="font-bold">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  Follow Factory
                </Button>
              </div>
            </div>

            {/* Featured Products */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">
                Featured Products in This Live
              </h2>
              {featuredProducts.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No featured products for this event yet.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {featuredProducts.map((product) => (
                    <Link key={product.id} href={`/shop/${product.id}`}>
                      <Card className="p-4 hover:border-primary transition-all hover:shadow-lg cursor-pointer">
                        <div className="flex gap-4">
                          <div className="relative w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <h3 className="font-bold text-foreground mb-1 truncate">
                                {product.name}
                              </h3>
                              <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-xl font-bold text-primary">
                                  ${product.price.toFixed(2)}
                                </span>
                                {product.compareAtPrice && (
                                  <span className="text-sm text-muted-foreground line-through">
                                    ${product.compareAtPrice.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-black font-bold">
                              BUY NOW
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Chat */}
          <div className="lg:col-span-1">
            <LiveChat
              eventId={liveEvent.id}
              className="h-[600px] lg:h-[calc(100vh-12rem)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
