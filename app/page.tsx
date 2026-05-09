'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { FakeChat } from '@/components/chat/FakeChat';
import { Clock, MessageSquare, Tag, Truck, Shield, CreditCard, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLiveEvents, useUpcomingEvents } from '@/hooks/useEvents';
import { useProducts } from '@/hooks/useProducts';

export default function HomePage() {
  // Fetch real data from APIs
  const { events: liveEventsRaw, loading: liveLoading } = useLiveEvents();
  const { events: upcomingEventsRaw, loading: upcomingLoading } = useUpcomingEvents(3);
  const { products: hotDealsRaw, loading: dealsLoading } = useProducts({
    isActive: true,
    limit: 6,
  });

  // Ensure data is always an array
  const liveEvents = Array.isArray(liveEventsRaw) ? liveEventsRaw : [];
  const upcomingEvents = Array.isArray(upcomingEventsRaw) ? upcomingEventsRaw : [];
  const hotDeals = Array.isArray(hotDealsRaw) ? hotDealsRaw : [];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotate carousel - disabled for now
  const autoRotate = false;

  // Map live events to carousel format
  const liveShows = liveEvents.map((event) => ({
    id: event.id,
    factory: event.manufacturers?.companyName || 'FACTORY',
    name: event.title.toUpperCase(),
    description: event.description,
    viewers: event.viewerCount,
    image: event.thumbnailUrl || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80',
  }));

  // Calculate countdown for upcoming shows
  const calculateCountdown = (scheduledStartTime: string) => {
    const now = new Date();
    const start = new Date(scheduledStartTime);
    const diff = start.getTime() - now.getTime();

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days: Math.max(0, days), hours: Math.max(0, hours), minutes: Math.max(0, minutes) };
  };

  // Map upcoming events
  const upcomingShows = upcomingEvents.map((event) => {
    const startTime = new Date(event.scheduledStartTime);
    const countdown = calculateCountdown(event.scheduledStartTime);

    return {
      id: event.id,
      factory: event.manufacturers?.companyName || 'FACTORY',
      name: event.title.toUpperCase(),
      time: startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      type: startTime.getHours() < 12 ? 'Morning Show' : startTime.getHours() < 17 ? 'Afternoon Show' : 'Evening Show',
      days: countdown.days,
      hours: countdown.hours,
      minutes: countdown.minutes,
      image: event.thumbnailUrl || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&q=80',
    };
  });

  // Map products with optional discount calculation
  const productsWithDiscounts = hotDeals.map(product => {
    const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
    const discount = hasDiscount && product.compareAtPrice
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : 0;
    return {
      id: product.id,
      name: product.name.toUpperCase(),
      discount,
      originalPrice: product.compareAtPrice || 0,
      salePrice: product.price,
      image: product.imageUrls[0] || 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&q=80',
      features: [product.category, 'In Stock', 'Free Shipping'],
      hasDiscount,
    };
  });

  // Auto-rotate carousel
  useEffect(() => {
    if (!liveShows.length) return;
    const timer = setInterval(() => {
      if (autoRotate) {
        setCurrentSlide((prev) => (prev + 1) % liveShows.length);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [liveShows.length, autoRotate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="py-8 lg:py-12 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Hero Text & CTA */}
            <div className="lg:col-span-3 space-y-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-4">
                  {liveShows.length} LIVE SHOWS.<br />
                  {liveShows.length} FACTORIES.<br />
                  1 <span className="text-primary">UNBEATABLE<br />EXPERIENCE.</span>
                </h1>
                <p className="text-base text-muted-foreground">
                  Real products. Real prices.<br />
                  Real time.
                </p>
              </div>

              {/* Countdown Card */}
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">48 HOURS ONLY</div>
                    <div className="text-sm text-primary font-semibold">TO REGISTER</div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Live shows on:</span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <div className="w-8 h-8 bg-muted rounded flex items-center justify-center text-lg">
                      📅
                    </div>
                    <span className="font-bold text-lg">24-25 MAY</span>
                  </div>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-2">
                  REGISTER NOW
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                </Button>
              </Card>
            </div>

            {/* Center: Live Shows Carousel */}
            <div className="lg:col-span-6 relative">
              {liveLoading ? (
                <div className="h-[450px] lg:h-[550px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading live shows...</p>
                  </div>
                </div>
              ) : liveShows.length === 0 ? (
                <div className="h-[450px] lg:h-[550px] flex items-center justify-center">
                  <Card className="p-8 text-center">
                    <p className="text-2xl mb-4">📺</p>
                    <h3 className="text-xl font-bold text-foreground mb-2">No Live Shows Right Now</h3>
                    <p className="text-muted-foreground mb-4">Check back soon for live factory tours!</p>
                    <Link href="/shop">
                      <Button>Browse Products</Button>
                    </Link>
                  </Card>
                </div>
              ) : (
                <div className="relative h-[450px] lg:h-[550px] overflow-visible">
                  {/* Glowing ring background */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    <div className="relative w-[60%] h-[70%]">
                      <div className="absolute inset-0 bg-primary/25 rounded-full blur-3xl animate-pulse" />
                      <div className="absolute inset-0 bg-primary/35 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.3s' }} />
                      <div className="absolute inset-0 bg-primary/45 rounded-full blur-xl" />
                    </div>
                  </div>

                  {/* Cards Container with Scale Effect */}
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                    <div className="relative w-full h-full flex items-center justify-center">
                      {liveShows.map((show, idx) => {
                        let distance = idx - currentSlide;

                        if (distance > liveShows.length / 2) {
                          distance -= liveShows.length;
                        } else if (distance < -liveShows.length / 2) {
                          distance += liveShows.length;
                        }

                        const scale = 1 - Math.abs(distance) * 0.15;
                        const opacity = distance === 0 ? 1 : 0.5 + (1 - Math.abs(distance) * 0.3);
                        const translateX = distance * 420;
                        const zIndex = 30 - Math.abs(distance) * 10;

                        return (
                          <div
                            key={show.id}
                            className="absolute transition-all duration-700 ease-out"
                            style={{
                              transform: `translateX(${translateX}px) scale(${scale})`,
                              opacity: opacity,
                              zIndex: zIndex,
                              width: '380px'
                            }}
                          >
                            <Card className={`overflow-hidden shadow-2xl transition-all duration-700 ${
                              distance === 0 ? 'border-2 border-primary/60' : 'border border-border/50'
                            }`}>
                              <div className="relative aspect-[3/4]">
                                <Image
                                  src={show.image}
                                  alt={show.name}
                                  fill
                                  className="object-cover"
                                  priority={distance === 0}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                                <Badge className={`absolute transition-all duration-700 ${
                                  distance === 0 ? 'top-4 left-4 text-sm px-3 py-1.5' : 'top-3 left-3 text-xs px-2 py-1'
                                } bg-red-600 text-white animate-pulse`}>
                                  ● LIVE
                                </Badge>

                                <div className={`absolute transition-all duration-700 ${
                                  distance === 0 ? 'top-4 right-4 px-3 py-1.5 text-sm' : 'top-3 right-3 px-2 py-1 text-xs'
                                } bg-black/60 backdrop-blur-sm rounded text-white font-medium`}>
                                  ● {show.viewers} watching
                                </div>

                                <div className={`absolute bottom-0 left-0 right-0 transition-all duration-700 ${
                                  distance === 0 ? 'p-6' : 'p-4'
                                }`}>
                                  <div className={`transition-all duration-700 ${
                                    distance === 0 ? 'text-xs' : 'text-[10px]'
                                  } text-white/60 mb-1`}>
                                    {show.factory}
                                  </div>
                                  <h3 className={`transition-all duration-700 ${
                                    distance === 0 ? 'text-xl lg:text-2xl' : 'text-sm'
                                  } font-bold text-white mb-1`}>
                                    {show.name}
                                  </h3>
                                  <p className={`transition-all duration-700 ${
                                    distance === 0 ? 'text-sm mb-4 opacity-100' : 'text-xs mb-2 opacity-80'
                                  } text-white/90`}>
                                    {show.description}
                                  </p>
                                  <div className={`transition-all duration-700 ${
                                    distance === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                                  }`}>
                                    <Link href="/live">
                                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                                        WATCH LIVE →
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Navigation arrows */}
                  {liveShows.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentSlide((prev) => (prev - 1 + liveShows.length) % liveShows.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-40 w-10 h-10 bg-background/90 backdrop-blur-sm border border-border rounded-full flex items-center justify-center hover:bg-muted hover:scale-110 transition-all shadow-lg"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setCurrentSlide((prev) => (prev + 1) % liveShows.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-40 w-10 h-10 bg-background/90 backdrop-blur-sm border border-border rounded-full flex items-center justify-center hover:bg-muted hover:scale-110 transition-all shadow-lg"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Carousel dots */}
              {liveShows.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {liveShows.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx === currentSlide ? 'bg-primary w-8' : 'bg-muted w-2 hover:bg-muted-foreground'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right: Live Chat (Fake for homepage) */}
            <div className="lg:col-span-3">
              <FakeChat />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y border-border bg-muted/20 py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Tag className="w-6 h-6 text-primary" />
              </div>
              <div className="font-bold text-sm text-foreground">FACTORY DIRECT</div>
              <div className="text-xs text-muted-foreground">Best Prices Guaranteed</div>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div className="font-bold text-sm text-foreground">LIVE AUCTIONS</div>
              <div className="text-xs text-muted-foreground">Real-Time Deals</div>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <div className="font-bold text-sm text-foreground">WORLDWIDE SHIPPING</div>
              <div className="text-xs text-muted-foreground">Fast & Safe Delivery</div>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div className="font-bold text-sm text-foreground">QUALITY CONTROL</div>
              <div className="text-xs text-muted-foreground">Before Every Shipment</div>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div className="font-bold text-sm text-foreground">SECURE PAYMENTS</div>
              <div className="text-xs text-muted-foreground">100% Protected</div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Shows */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left */}
            <div className="lg:col-span-3 flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-6 leading-tight">
                  UPCOMING<br />
                  LIVE SHOWS
                </h2>
                <div className="space-y-1 text-base text-white/60 mb-8">
                  <p>See the chairs.</p>
                  <p>Ask questions.</p>
                  <p>Get exclusive</p>
                  <p>factory prices.</p>
                </div>
              </div>
              <div>
                <button className="text-primary font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                  VIEW FULL SCHEDULE <span>→</span>
                </button>
              </div>
            </div>

            {/* Center - Show Cards */}
            <div className="lg:col-span-6">
              {upcomingLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-white/60">Loading upcoming shows...</p>
                  </div>
                </div>
              ) : upcomingShows.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-white/60">No upcoming shows scheduled yet. Check back soon!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {upcomingShows.slice(0, 3).map((show) => (
                    <Card key={show.id} className="bg-zinc-900/50 border-zinc-800 overflow-hidden hover:border-primary/50 transition-all">
                      <div className="relative h-48">
                        <Image src={show.image} alt={show.name} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                        <div className="absolute top-3 left-3">
                          <Badge className="bg-red-600 text-white text-xs font-bold px-2 py-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-white rounded-full" />
                            UPCOMING
                          </Badge>
                        </div>

                        <div className="absolute top-3 right-3 text-right">
                          <div className="text-white font-bold text-lg">{show.time}</div>
                          <div className="text-white/70 text-xs">{show.type}</div>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs text-white/70 inline-block mb-1">
                            {show.factory}
                          </div>
                          <div className="font-bold text-white text-base">
                            {show.name}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-black/50 rounded-lg p-3 text-center border border-zinc-800">
                            <div className="text-3xl font-bold text-white">{String(show.days).padStart(2, '0')}</div>
                            <div className="text-[10px] text-white/50 font-medium mt-1">DAYS</div>
                          </div>
                          <div className="bg-black/50 rounded-lg p-3 text-center border border-zinc-800">
                            <div className="text-3xl font-bold text-white">{String(show.hours).padStart(2, '0')}</div>
                            <div className="text-[10px] text-white/50 font-medium mt-1">HRS</div>
                          </div>
                          <div className="bg-black/50 rounded-lg p-3 text-center border border-zinc-800">
                            <div className="text-3xl font-bold text-white">{String(show.minutes).padStart(2, '0')}</div>
                            <div className="text-[10px] text-white/50 font-medium mt-1">MIN</div>
                          </div>
                        </div>

                        <Button className="w-full bg-primary hover:bg-primary/90 text-black font-bold text-sm py-2.5">
                          <span className="mr-2">🔔</span>
                          REMIND ME
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Right - Exclusive Deals */}
            <div className="lg:col-span-3">
              <Card className="bg-zinc-900/50 border-zinc-800 p-6 text-center h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-primary mb-2 leading-tight">
                    EXCLUSIVE<br />
                    LIVE ONLY<br />
                    DEALS
                  </h3>
                  <p className="text-sm text-primary/80 mb-6">
                    Prices you won't<br />
                    find anywhere else.
                  </p>
                </div>

                <div className="relative h-48 mb-6">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-3">
                    <div className="w-full h-full rounded-full bg-gradient-to-r from-transparent via-primary to-transparent blur-md opacity-60" />
                    <div className="absolute inset-0 rounded-full border-2 border-primary/50" style={{ transform: 'perspective(100px) rotateX(60deg)' }} />
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-32 h-32">
                      <Image
                        src="https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&q=80"
                        alt="Exclusive chair"
                        fill
                        className="object-contain drop-shadow-2xl"
                      />
                    </div>
                  </div>
                </div>

                <Link href="/live">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-black font-bold">
                    JOIN THE LIVE
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Hot Live Deals */}
      <section className="py-12 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔥</span>
              <h2 className="text-3xl font-bold text-foreground">
                HOT LIVE DEALS
              </h2>
            </div>
            <Link href="/shop">
              <Button variant="outline" className="gap-2">
                VIEW ALL
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="relative">
            {dealsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading deals...</p>
                </div>
              </div>
            ) : productsWithDiscounts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No special deals available right now. Check back soon!</p>
              </div>
            ) : (
              <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
                {productsWithDiscounts.map((deal) => (
                  <Card key={deal.id} className="flex-shrink-0 w-[280px] overflow-hidden hover:border-primary transition-all hover:shadow-xl group">
                    <Link href={`/shop/${deal.id}`}>
                      <div className="relative">
                        {deal.hasDiscount && (
                          <div className="absolute top-3 left-3 z-10">
                            <Badge className="bg-red-600 text-white text-sm font-bold px-3 py-1">
                              -{deal.discount}%
                            </Badge>
                          </div>
                        )}

                        <div className="relative aspect-[4/5] bg-muted">
                          <Image
                            src={deal.image}
                            alt={deal.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-bold text-foreground mb-2">
                            {deal.name}
                          </h3>

                          <div className="flex items-baseline gap-2 mb-3">
                            {deal.hasDiscount && (
                              <span className="text-xs text-muted-foreground line-through">
                                ${deal.originalPrice.toFixed(2)}
                              </span>
                            )}
                            <span className="text-2xl font-bold text-primary">
                              ${deal.salePrice.toFixed(2)}
                            </span>
                          </div>

                          <ul className="space-y-1 mb-4">
                            {deal.features.map((feature, idx) => (
                              <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex gap-2">
                          <Button className="flex-1 bg-primary hover:bg-primary/90 font-bold">
                            BUY NOW
                          </Button>
                        </div>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            HOW IT WORKS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {[
              { icon: '▶️', step: '1. REGISTER', text: 'Register for free and join our live factory tours.' },
              { icon: '➖', step: '2. WATCH & ASK', text: 'Watch the products, ask questions in real-time.' },
              { icon: '🏷️', step: '3. GET LIVE PRICES', text: 'Receive exclusive prices only during the show.' },
              { icon: '🚚', step: '4. ORDER & RELAX', text: 'We handle the rest and deliver to your door.' },
              { icon: '🪑', step: '5. ENJOY YOUR CHAIR', text: 'Premium quality chairs at factory prices!' }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-foreground mb-2 text-sm">{item.step}</h3>
                <p className="text-xs text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* We Are The Factory */}
      <section className="relative h-64 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/factory-banner.jpg"
            alt="Factory"
            fill
            className="object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60" />
        </div>

        <div className="container mx-auto px-4 h-full relative z-10">
          <div className="h-full flex items-center justify-center">
            <div className="max-w-3xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                WE ARE
              </h2>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-primary">
                <span className="text-primary">THE FACTORY</span>
              </h2>
              <p className="text-md md:text-xl text-white/90">
                No middleman. No extra cost.<br/>
                You deal directly with us <br/>
                and we ship directly to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Trust Badges */}
      <section className="border-t border-border bg-black text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <Shield className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <div className="font-bold text-sm mb-1">SECURE & TRUSTED</div>
                <div className="text-xs text-white/70">100% secure payments and buyer protection.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-xs">30</span>
              </div>
              <div>
                <div className="font-bold text-sm mb-1">30-DAY WARRANTY</div>
                <div className="text-xs text-white/70">All chairs come with a 30-day quality warranty.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageSquare className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <div className="font-bold text-sm mb-1">24/7 CUSTOMER SUPPORT</div>
                <div className="text-xs text-white/70">We're here to help you anytime you need.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex -space-x-2 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary" />
                <div className="w-8 h-8 rounded-full bg-primary/80" />
                <div className="w-8 h-8 rounded-full bg-primary/60" />
              </div>
              <div>
                <div className="font-bold text-sm mb-1">10,000+</div>
                <div className="text-xs text-white/70">Happy Customers Worldwide</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
