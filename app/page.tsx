import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CountdownTimer } from '@/components/countdown-timer';
import { ThemeToggle } from '@/components/theme-toggle';
import { Clock, MessageSquare, Tag, Truck, Shield, CreditCard } from 'lucide-react';

export default function HomePage() {
  const nextEventDate = new Date();
  nextEventDate.setHours(nextEventDate.getHours() + 48);

  const liveShows = [
    {
      id: '1',
      factory: 'FACTORY 01',
      name: 'COLOSSEUM FURNITURE',
      description: 'Premium Ergonomic Chairs',
      viewers: 356,
      image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&q=80'
    },
    {
      id: '2',
      factory: 'FACTORY 02',
      name: 'GLOBAL SEATING',
      description: 'Ergonomic Mesh & Executive Chairs',
      viewers: 892,
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
      featured: true
    },
    {
      id: '3',
      factory: 'FACTORY 03',
      name: 'ULTIMATE CHAIRS',
      description: 'Luxury & Designer Chairs',
      viewers: 278,
      image: 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=600&q=80'
    }
  ];

  const upcomingShows = [
    {
      factory: 'FACTORY 01',
      name: 'COLOSSEUM FURNITURE',
      time: '10:00 AM',
      type: 'Morning Show',
      days: 2,
      hours: 15,
      minutes: 30
    },
    {
      factory: 'FACTORY 02',
      name: 'GLOBAL SEATING',
      time: '02:00 PM',
      type: 'Afternoon Show',
      days: 2,
      hours: 19,
      minutes: 30
    },
    {
      factory: 'FACTORY 03',
      name: 'ULTIMATE CHAIRS',
      time: '06:00 PM',
      type: 'Evening Show',
      days: 2,
      hours: 23,
      minutes: 30
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                <span className="text-2xl">🪑</span>
              </div>
              <div className="text-left">
                <div className="font-bold text-foreground">
                  LIVE<span className="text-primary">CHAIRS</span>
                </div>
                <div className="text-xs text-muted-foreground">FACTORY LIVE</div>
              </div>
            </Link>

            <nav className="hidden lg:flex gap-8">
              <Link href="/live" className="text-sm font-medium text-foreground hover:text-primary">
                LIVE SHOWS
              </Link>
              <Link href="/shop" className="text-sm font-medium text-foreground hover:text-primary">
                ALL CHAIRS
              </Link>
              <Link href="#" className="text-sm font-medium text-foreground hover:text-primary">
                FACTORIES
              </Link>
              <Link href="#how-it-works" className="text-sm font-medium text-foreground hover:text-primary">
                HOW IT WORKS
              </Link>
              <Link href="#" className="text-sm font-medium text-foreground hover:text-primary">
                ABOUT US
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                REGISTER FOR LIVE
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Live Shows */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left: Hero Text */}
            <div className="lg:col-span-1 space-y-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                  3 LIVE SHOWS.<br />
                  3 FACTORIES.<br />
                  1 <span className="text-primary">UNBEATABLE<br />EXPERIENCE.</span>
                </h1>
                <p className="text-muted-foreground">
                  Real products. Real prices.<br />Real time.
                </p>
              </div>

              <Card className="bg-card border-primary border-2 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                  <div>
                    <div className="text-sm font-bold text-foreground">48 HOURS ONLY</div>
                    <div className="text-xs text-primary">TO REGISTER</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-muted rounded flex items-center justify-center">📅</div>
                    <span>24-25 MAY</span>
                  </div>
                </div>
                <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                  REGISTER NOW
                </Button>
              </Card>
            </div>

            {/* Center: Live Show Cards Carousel */}
            <div className="lg:col-span-2">
              <div className="relative">
                {liveShows.map((show, idx) => (
                  <Card
                    key={show.id}
                    className={`overflow-hidden cursor-pointer hover:shadow-2xl transition-all ${
                      idx === 1 ? 'block' : 'hidden'
                    }`}
                  >
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={show.image}
                        alt={show.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Live Badge */}
                      <Badge className="absolute top-4 left-4 bg-red-600 text-white animate-pulse">
                        ● LIVE
                      </Badge>
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-3 py-1 rounded text-white text-sm">
                        ● {show.viewers} watching
                      </div>

                      {/* Factory Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="text-xs text-white/80 mb-2">{show.factory}</div>
                        <h3 className="text-2xl font-bold text-white mb-1">{show.name}</h3>
                        <p className="text-sm text-white/90 mb-4">{show.description}</p>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                          WATCH LIVE →
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}

                {/* Carousel dots */}
                <div className="flex justify-center gap-2 mt-4">
                  {liveShows.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full ${
                        idx === 1 ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Live Chat */}
            <div className="lg:col-span-1">
              <Card className="h-full p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground">LIVE CHAT</h3>
                  <Badge variant="outline">● 243 online</Badge>
                </div>
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-primary" />
                      <span className="font-semibold text-foreground">Avi from Israel</span>
                    </div>
                    <p className="text-muted-foreground">Amazing quality! 🔥</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-blue-600" />
                      <span className="font-semibold text-foreground">Sarah from USA</span>
                    </div>
                    <p className="text-muted-foreground">Just ordered 2 chairs!</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-green-600" />
                      <span className="font-semibold text-foreground">John from UK</span>
                    </div>
                    <p className="text-muted-foreground">Best prices ever 💯</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y border-border bg-muted/30 py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <Tag className="w-8 h-8 text-primary" />
              <div className="font-semibold text-sm text-foreground">FACTORY DIRECT</div>
              <div className="text-xs text-muted-foreground">Best Prices Guaranteed</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <MessageSquare className="w-8 h-8 text-primary" />
              <div className="font-semibold text-sm text-foreground">LIVE AUCTIONS</div>
              <div className="text-xs text-muted-foreground">Real-Time Deals</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Truck className="w-8 h-8 text-primary" />
              <div className="font-semibold text-sm text-foreground">WORLDWIDE SHIPPING</div>
              <div className="text-xs text-muted-foreground">Fast & Safe Delivery</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              <div className="font-semibold text-sm text-foreground">QUALITY CONTROL</div>
              <div className="text-xs text-muted-foreground">Before Every Shipment</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <CreditCard className="w-8 h-8 text-primary" />
              <div className="font-semibold text-sm text-foreground">SECURE PAYMENTS</div>
              <div className="text-xs text-muted-foreground">100% Protected</div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Shows */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                UPCOMING<br />LIVE SHOWS
              </h2>
              <p className="text-muted-foreground mb-4">
                See the chairs.<br />
                Ask questions.<br />
                Get exclusive<br />
                factory prices.
              </p>
              <Button variant="outline" className="font-bold">
                VIEW FULL SCHEDULE →
              </Button>
            </div>

            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingShows.map((show, idx) => (
                <Card key={idx} className="p-4 border-2 hover:border-primary transition-colors">
                  <Badge className="bg-red-600 text-white mb-2">● LIVE</Badge>
                  <div className="text-xs text-muted-foreground mb-1">{show.time}</div>
                  <div className="text-sm font-semibold text-foreground mb-3">{show.type}</div>

                  <div className="text-xs text-muted-foreground mb-2">{show.factory}</div>
                  <div className="font-bold text-foreground mb-4">{show.name}</div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">{String(show.days).padStart(2, '0')}</div>
                      <div className="text-xs text-muted-foreground">DAYS</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">{String(show.hours).padStart(2, '0')}</div>
                      <div className="text-xs text-muted-foreground">HRS</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">{String(show.minutes).padStart(2, '0')}</div>
                      <div className="text-xs text-muted-foreground">MIN</div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    🔔 REMIND ME
                  </Button>
                </Card>
              ))}
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
              <Card key={chair.id} className="overflow-hidden hover:border-primary transition-colors cursor-pointer">
                <div className="relative aspect-square">
                  <Image
                    src={chair.image}
                    alt="Premium chair"
                    fill
                    className="object-cover"
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
      <section id="how-it-works" className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            HOW IT WORKS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {[
              { step: '1. REGISTER', text: 'Register for free and join our live factory tours.' },
              { step: '2. WATCH & ASK', text: 'Watch the products, ask questions in real-time.' },
              { step: '3. GET LIVE PRICES', text: 'Receive exclusive prices only during the show.' },
              { step: '4. ORDER & RELAX', text: 'We handle the rest and deliver to your door.' },
              { step: '5. ENJOY YOUR CHAIR', text: 'Premium quality chairs at factory prices!' }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {idx + 1}
                </div>
                <h3 className="font-bold text-foreground mb-2">{item.step}</h3>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
