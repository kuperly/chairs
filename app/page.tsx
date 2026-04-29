import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from '@/components/countdown-timer';

export default function HomePage() {
  // Set countdown to 2 days from now for demo
  const nextEventDate = new Date();
  nextEventDate.setDate(nextEventDate.getDate() + 2);
  nextEventDate.setHours(14, 0, 0, 0); // 2:00 PM

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              COLOSSEUM
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/shop" className="text-foreground hover:text-primary hidden sm:inline">
                Shop
              </Link>
              <Link href="/live" className="text-foreground hover:text-primary hidden sm:inline">
                Live Now
              </Link>
              <Link href="/login" className="text-foreground hover:text-primary">
                Login
              </Link>
              <Button size="sm">Cart (0)</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 sm:py-24 lg:py-32">
          <div className="text-center space-y-8">
            {/* Live Badge */}
            <div className="flex justify-center">
              <Badge className="bg-red-600 text-white px-4 py-2 text-sm font-bold animate-pulse">
                🔴 LIVE NOW
              </Badge>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <div className="flex justify-center gap-4 text-4xl sm:text-6xl lg:text-7xl font-bold">
                <span className="text-primary">WATCH</span>
                <span className="text-foreground">·</span>
                <span className="text-primary">ASK</span>
                <span className="text-foreground">·</span>
                <span className="text-primary">BUY</span>
              </div>

              <p className="text-xl sm:text-2xl lg:text-3xl text-muted-foreground max-w-3xl mx-auto">
                Real factories. Real people. Real deals – Live.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-6 text-lg"
                asChild
              >
                <Link href="/live">JOIN LIVE NOW</Link>
              </Button>
              <Button size="lg" variant="outline" className="font-bold px-8 py-6 text-lg">
                HOW IT WORKS
              </Button>
            </div>

            {/* Viewer Count */}
            <p className="text-muted-foreground">
              <span className="text-primary font-bold">2,847</span> watching now
            </p>
          </div>
        </div>

        {/* Gradient Background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
      </section>

      {/* Next Event Countdown */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              NEXT LIVE EVENT
            </h2>

            <CountdownTimer targetDate={nextEventDate} />

            <Button variant="secondary" size="lg" className="mt-4">
              Get Notified
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Live Factory Tours',
                description: 'See products being made in real-time',
                icon: '🏭'
              },
              {
                title: 'Ask Questions Live',
                description: 'Chat directly with manufacturers',
                icon: '💬'
              },
              {
                title: 'Exclusive Deals',
                description: 'Limited-time prices during events',
                icon: '🔥'
              }
            ].map((feature) => (
              <div key={feature.title} className="bg-card border border-border rounded-lg p-6 space-y-4 hover:border-primary transition-colors">
                <div className="text-4xl">{feature.icon}</div>
                <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm">
            The world&apos;s first live factory shopping experience.
          </p>
          <p className="text-sm mt-2">
            © 2024 Colosseum Live Factory. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
