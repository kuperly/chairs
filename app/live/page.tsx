'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLiveEvents } from '@/hooks/useEvents';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';

export default function LiveRedirectPage() {
  const { events: eventsRaw, loading, error } = useLiveEvents();
  const router = useRouter();

  const events = Array.isArray(eventsRaw) ? eventsRaw : [];
  const liveEvent = events[0];

  useEffect(() => {
    // Auto-redirect to first live event if exists
    if (!loading && liveEvent) {
      router.replace(`/live/${liveEvent.id}`);
    }
  }, [loading, liveEvent, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading live events...</p>
        </div>
      </div>
    );
  }

  // If redirecting, show loading
  if (liveEvent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting to live event...</p>
        </div>
      </div>
    );
  }

  // No live events - show message
  return (
    <div className="min-h-screen bg-background">
      <Header />

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
