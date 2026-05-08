'use client';

import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { Send, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useLiveEvents } from '@/hooks/useEvents';

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

export default function LivePage() {
  const [message, setMessage] = useState('');
  const { events: eventsRaw, loading, error } = useLiveEvents();

  // Ensure events is always an array
  const events = Array.isArray(eventsRaw) ? eventsRaw : [];

  // Get the first live event (assuming single live event at a time for POC)
  const liveEvent = events[0];

  // Mock chat messages (not in database yet for POC)
  const chatMessages = [
    { id: 1, user: 'Avi from Israel', message: 'Amazing quality! 🔥', time: '2m ago' },
    { id: 2, user: 'Sarah M.', message: 'Does it come with a warranty?', time: '3m ago' },
    { id: 3, user: 'Mike R.', message: 'Just ordered one! Great deal!', time: '5m ago' },
    { id: 4, user: 'Daniel', message: 'Do you ship to Israel?', time: '6m ago' },
    { id: 5, user: 'LiveChairs Team', message: 'Yes! We ship worldwide 🌍', time: '6m ago' }
  ];

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
        {/* Header */}
        <header className="border-b border-border bg-background sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link href="/">
                <div className="h-12 sm:h-14 w-auto relative" style={{ width: '200px' }}>
                  <Image
                    src="/logo.png"
                    alt="LiveChairs Logo"
                    fill
                    className="object-contain object-left"
                    priority
                  />
                </div>
              </Link>

              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Button size="sm" variant="outline">Cart (0)</Button>
              </div>
            </div>
          </div>
        </header>

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
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <div className="h-12 sm:h-14 w-auto relative" style={{ width: '200px' }}>
                <Image
                  src="/logo.png"
                  alt="LiveChairs Logo"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Badge className="bg-red-600 text-white animate-pulse hidden sm:flex">
                🔴 LIVE NOW
              </Badge>
              <ThemeToggle />
              <Button size="sm" variant="outline">Cart (0)</Button>
            </div>
          </div>
        </div>
      </header>

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
                <Button className="bg-primary hover:bg-primary/90 text-black font-bold">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  Share Event
                </Button>
                <Button variant="outline" className="font-bold">
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
            <Card className="h-[600px] lg:h-[calc(100vh-12rem)] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-card">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-bold text-foreground">LIVE CHAT</h2>
                  <Badge variant="outline" className="text-xs">
                    ● {liveEvent.viewerCount} online
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ask questions, get answers in real-time
                </p>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-xs font-bold">
                        {msg.user.charAt(0)}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {msg.user}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {msg.time}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground ml-10">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-border bg-card">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="icon" className="bg-primary hover:bg-primary/90 text-black">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  💬 Chat powered by Agora RTM
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
