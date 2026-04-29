'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { Clock, MessageSquare, Tag, Truck, Shield, CreditCard, ChevronLeft, ChevronRight, Calendar, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

export default function HomePage() {
  const liveShows = [
    {
      id: '1',
      factory: 'FACTORY 01',
      name: 'COLOSSEUM FURNITURE',
      description: 'Premium Ergonomic Chairs',
      viewers: 356,
      image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80'
    },
    {
      id: '2',
      factory: 'FACTORY 02',
      name: 'GLOBAL SEATING',
      description: 'Ergonomic Mesh & Executive Chairs',
      viewers: 892,
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'
    },
    {
      id: '3',
      factory: 'FACTORY 03',
      name: 'ULTIMATE CHAIRS',
      description: 'Luxury & Designer Chairs',
      viewers: 278,
      image: 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800&q=80'
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(1);

  // Auto-rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % liveShows.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [liveShows.length]);

  const upcomingShows = [
    {
      factory: 'FACTORY 01',
      name: 'COLOSSEUM FURNITURE',
      time: '10:00 AM',
      type: 'Morning Show',
      days: 2,
      hours: 15,
      minutes: 30,
      image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&q=80'
    },
    {
      factory: 'FACTORY 02',
      name: 'GLOBAL SEATING',
      time: '02:00 PM',
      type: 'Afternoon Show',
      days: 2,
      hours: 19,
      minutes: 30,
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80'
    },
    {
      factory: 'FACTORY 03',
      name: 'ULTIMATE CHAIRS',
      time: '06:00 PM',
      type: 'Evening Show',
      days: 2,
      hours: 23,
      minutes: 30,
      image: 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=400&q=80'
    }
  ];

  const premiumChairs = [
    { id: 1, image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=300&q=80' },
    { id: 2, image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=300&q=80' },
    { id: 3, image: 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=300&q=80' },
    { id: 4, image: 'https://images.unsplash.com/photo-1591825729269-caeb344f6df2?w=300&q=80' },
    { id: 5, image: 'https://images.unsplash.com/photo-1580480055226-13c68314c2aa?w=300&q=80' },
    { id: 6, image: 'https://images.unsplash.com/photo-1598300188881-74ebc72c0e86?w=300&q=80' }
  ];

  const chatMessages = [
    { name: 'Avi from Israel', message: 'Amazing quality! 🔥', avatar: '👤' },
    { name: 'Daniel', message: 'Do you ship to Israel?', avatar: '👤' },
    { name: 'LiveChairs Team', message: 'Yes, we do! Shipping is included in the price.', avatar: '👤' },
    { name: 'Michael', message: 'These prices are insane!', avatar: '👤' },
    { name: 'Eyal Gaming', message: 'Which chair is best for long hours?', avatar: '👤' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                <span className="text-2xl">🪑</span>
              </div>
              <div className="text-left">
                <div className="font-bold text-foreground text-lg">
                  LIVE<span className="text-primary">CHAIRS</span>
                </div>
                <div className="text-[10px] text-muted-foreground tracking-wide">FACTORY LIVE</div>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden lg:flex gap-8">
              <Link href="/live" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                LIVE SHOWS
              </Link>
              <Link href="/shop" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                ALL CHAIRS
              </Link>
              <Link href="/dashboard" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                FACTORIES
              </Link>
              <Link href="#how-it-works" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                HOW IT WORKS
              </Link>
              <Link href="#" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                ABOUT US
              </Link>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary">
                🌐 EN
              </button>
              <button className="p-2 hover:bg-muted rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              <ThemeToggle />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm px-6">
                REGISTER FOR LIVE
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-8 lg:py-12 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Hero Text & CTA */}
            <div className="lg:col-span-3 space-y-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-4">
                  3 LIVE SHOWS.<br />
                  3 FACTORIES.<br />
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

            {/* Center: 3D Carousel */}
            <div className="lg:col-span-6 relative">
              <div className="relative h-[450px] lg:h-[550px]">
                {/* Glowing ring background - always visible */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-[85%] h-[85%]">
                    {/* Multiple glowing rings */}
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.3s' }} />
                    <div className="absolute inset-0 bg-primary/40 rounded-full blur-xl" />
                  </div>
                </div>

                {/* Cards Container */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Left Card */}
                  <div className="absolute left-[5%] top-1/2 -translate-y-1/2 w-[35%] z-10 opacity-80 scale-90">
                    <Card className="overflow-hidden border border-border shadow-xl">
                      <div className="relative aspect-[3/4]">
                        <Image
                          src={liveShows[(currentSlide - 1 + liveShows.length) % liveShows.length].image}
                          alt="Previous show"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <Badge className="absolute top-3 left-3 bg-red-600 text-white text-xs px-2 py-1">
                          ● LIVE
                        </Badge>
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-white text-xs">
                          ● {liveShows[(currentSlide - 1 + liveShows.length) % liveShows.length].viewers} watching
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Center Card (Main) */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[45%] z-30 transition-all duration-500">
                    <Card className="overflow-hidden border-2 border-primary/40 shadow-2xl">
                      <div className="relative aspect-[3/4]">
                        <Image
                          src={liveShows[currentSlide].image}
                          alt={liveShows[currentSlide].name}
                          fill
                          className="object-cover"
                          priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                        <Badge className="absolute top-4 left-4 bg-red-600 text-white text-sm px-3 py-1.5 animate-pulse">
                          ● LIVE
                        </Badge>

                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded text-white text-sm font-medium">
                          ● {liveShows[currentSlide].viewers} watching
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <div className="text-xs text-white/60 mb-2">{liveShows[currentSlide].factory}</div>
                          <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">
                            {liveShows[currentSlide].name}
                          </h3>
                          <p className="text-sm text-white/90 mb-4">
                            {liveShows[currentSlide].description}
                          </p>
                          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                            WATCH LIVE →
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Right Card */}
                  <div className="absolute right-[5%] top-1/2 -translate-y-1/2 w-[35%] z-10 opacity-80 scale-90">
                    <Card className="overflow-hidden border border-border shadow-xl">
                      <div className="relative aspect-[3/4]">
                        <Image
                          src={liveShows[(currentSlide + 1) % liveShows.length].image}
                          alt="Next show"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        <Badge className="absolute top-3 left-3 bg-red-600 text-white text-xs px-2 py-1">
                          ● LIVE
                        </Badge>
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-white text-xs">
                          ● {liveShows[(currentSlide + 1) % liveShows.length].viewers} watching
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Navigation arrows */}
                <button
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + liveShows.length) % liveShows.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-40 w-10 h-10 bg-background/90 backdrop-blur-sm border border-border rounded-full flex items-center justify-center hover:bg-muted transition-all shadow-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % liveShows.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-40 w-10 h-10 bg-background/90 backdrop-blur-sm border border-border rounded-full flex items-center justify-center hover:bg-muted transition-all shadow-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Carousel dots */}
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
            </div>

            {/* Right: Live Chat */}
            <div className="lg:col-span-3">
              <Card className="h-[500px] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-bold text-foreground">LIVE CHAT</h3>
                  <Badge variant="outline" className="text-xs">
                    ● 243 online
                  </Badge>
                </div>

                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-xs">
                          {msg.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-sm text-foreground">{msg.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-10">{msg.message}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input placeholder="Type a message..." className="flex-1" />
                    <Button size="icon" className="bg-primary hover:bg-primary/90">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
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
      <section className="py-12 bg-gradient-to-b from-black to-black/95 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left */}
            <div className="lg:col-span-3">
              <h2 className="text-3xl font-bold mb-6">
                <Badge className="bg-red-600 text-white mb-3 text-xs">● LIVE</Badge>
                <br />
                UPCOMING<br />
                LIVE SHOWS
              </h2>
              <div className="space-y-2 text-sm text-white/70 mb-6">
                <p>See the chairs.</p>
                <p>Ask questions.</p>
                <p>Get exclusive</p>
                <p>factory prices.</p>
              </div>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white font-bold">
                VIEW FULL SCHEDULE →
              </Button>
            </div>

            {/* Center - Show Cards */}
            <div className="lg:col-span-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingShows.map((show, idx) => (
                <Card key={idx} className="bg-black/50 border-white/10 overflow-hidden">
                  <div className="relative h-32">
                    <Image src={show.image} alt={show.name} fill className="object-cover opacity-40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                    <Badge className="absolute top-2 left-2 bg-red-600 text-white text-xs">
                      ● LIVE
                    </Badge>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="text-xs text-white/50">{show.time}</div>
                      <div className="text-sm font-semibold text-white">{show.type}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/50">{show.factory}</div>
                      <div className="font-bold text-white text-sm">{show.name}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 py-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{String(show.days).padStart(2, '0')}</div>
                        <div className="text-[10px] text-white/50">DAYS</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{String(show.hours).padStart(2, '0')}</div>
                        <div className="text-[10px] text-white/50">HRS</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{String(show.minutes).padStart(2, '0')}</div>
                        <div className="text-[10px] text-white/50">MIN</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full border-primary/50 text-primary hover:bg-primary hover:text-white">
                      🔔 REMIND ME
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Right - Exclusive Deals */}
            <div className="lg:col-span-3">
              <Card className="bg-gradient-to-b from-black to-black/80 border-primary/30 p-6 text-center h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-primary mb-2">EXCLUSIVE</h3>
                  <h3 className="text-2xl font-bold text-primary mb-3">LIVE ONLY</h3>
                  <h3 className="text-2xl font-bold text-primary mb-6">DEALS</h3>
                  <p className="text-sm text-white/70 mb-6">
                    Prices you won't<br />
                    find anywhere else.
                  </p>
                </div>
                <div className="relative h-40 mb-6">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-4 border-primary/30 animate-pulse" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl">🪑</span>
                  </div>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-white font-bold">
                  JOIN THE LIVE
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Chairs */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              PREMIUM CHAIRS WITHOUT THE PREMIUM PRICE
            </h2>
            <p className="text-muted-foreground">
              Top quality chairs that in stores cost $1700+
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {premiumChairs.map((chair) => (
              <Card key={chair.id} className="overflow-hidden hover:border-primary transition-colors cursor-pointer group">
                <div className="relative aspect-square">
                  <Image
                    src={chair.image}
                    alt="Premium chair"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              </Card>
            ))}
          </div>

          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
            EXPLORE CHAIRS
          </Button>
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
