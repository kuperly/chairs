import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CountdownTimer } from '@/components/countdown-timer';

export default function HomePage() {
  const nextEventDate = new Date();
  nextEventDate.setDate(nextEventDate.getDate() + 2);
  nextEventDate.setHours(14, 0, 0, 0);

  // Featured products on homepage
  const featuredProducts = [
    {
      id: '1',
      name: 'Executive Office Chair',
      price: 299.99,
      compareAtPrice: 449.99,
      imageUrl: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80',
      badge: 'LIVE NOW',
      viewers: 234
    },
    {
      id: '2',
      name: 'Standing Desk Pro',
      price: 599.99,
      compareAtPrice: 799.99,
      imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800&q=80',
      badge: 'HOT DEAL',
      savings: 25
    },
    {
      id: '3',
      name: 'Ergonomic Mesh Chair',
      price: 249.99,
      compareAtPrice: 399.99,
      imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80',
      badge: 'BEST SELLER',
      rating: 4.9
    },
    {
      id: '4',
      name: 'Conference Table',
      price: 1299.99,
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
      badge: 'LAST CHANCE',
      stock: 3
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
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
              <Button size="sm" variant="outline">Cart (0)</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Live Event */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Hero Content */}
            <div className="space-y-6 text-center lg:text-left">
              <Badge className="bg-red-600 text-white px-4 py-2 animate-pulse">
                🔴 LIVE NOW - Factory Tour
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
                <span className="text-primary">WATCH</span> factories.{' '}
                <span className="text-primary">ASK</span> questions.{' '}
                <span className="text-primary">BUY</span> direct.
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl">
                Get exclusive factory prices on premium office furniture. Watch live production,
                ask manufacturers directly, and save up to 50%.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link href="/live">
                    Join Live Event
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                  <Link href="/shop">
                    Browse Products
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-6 justify-center lg:justify-start text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <span className="text-foreground font-semibold">4.9/5</span>
                  <span className="text-muted-foreground">(2,847 reviews)</span>
                </div>
                <div className="text-muted-foreground">
                  <span className="text-primary font-bold">234</span> watching now
                </div>
              </div>
            </div>

            {/* Right: Live Preview */}
            <div className="relative">
              <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-primary/50">
                <Image
                  src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80"
                  alt="Live factory tour"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Live Badge */}
                <Badge className="absolute top-4 left-4 bg-red-600 text-white animate-pulse">
                  🔴 LIVE
                </Badge>

                {/* Quick Stats */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/80 backdrop-blur rounded-lg p-4 space-y-2">
                    <p className="text-white font-semibold">Executive Office Chair</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-primary text-2xl font-bold">$299</span>
                        <span className="text-white/60 line-through ml-2">$449</span>
                      </div>
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        Buy Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Live Deals Right Now
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Exclusive prices available only during live events. Limited quantities!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="group overflow-hidden hover:shadow-xl hover:border-primary transition-all">
                <Link href={`/shop/${product.id}`}>
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />

                    {/* Badge */}
                    <Badge
                      className={`absolute top-3 left-3 ${
                        product.badge === 'LIVE NOW' ? 'bg-red-600 animate-pulse' :
                        product.badge === 'HOT DEAL' ? 'bg-orange-600' :
                        product.badge === 'BEST SELLER' ? 'bg-blue-600' :
                        'bg-purple-600'
                      } text-white font-bold`}
                    >
                      {product.badge}
                    </Badge>

                    {/* Quick Action on Hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button className="bg-primary hover:bg-primary/90">
                        View Details →
                      </Button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 space-y-3">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-primary">
                        ${product.price}
                      </span>
                      {product.compareAtPrice && (
                        <>
                          <span className="text-sm text-muted-foreground line-through">
                            ${product.compareAtPrice}
                          </span>
                          <Badge variant="destructive" className="ml-auto">
                            -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
                          </Badge>
                        </>
                      )}
                    </div>

                    {/* Additional Info */}
                    <div className="flex items-center gap-2 text-sm">
                      {product.viewers && (
                        <span className="text-muted-foreground">
                          👥 {product.viewers} watching
                        </span>
                      )}
                      {product.rating && (
                        <span className="text-foreground">
                          ⭐ {product.rating}
                        </span>
                      )}
                      {product.stock && (
                        <span className="text-red-500 font-semibold">
                          Only {product.stock} left!
                        </span>
                      )}
                    </div>

                    {/* CTA */}
                    <Button className="w-full" size="sm">
                      {product.badge === 'LIVE NOW' ? 'Watch & Buy' : 'Add to Cart'}
                    </Button>
                  </div>
                </Link>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button size="lg" variant="outline" asChild>
              <Link href="/shop">
                View All Products →
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Countdown to Next Event */}
      <section className="border-y border-border bg-card/30">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              🎯 Next Live Event
            </h2>
            <p className="text-muted-foreground">
              Standing Desk Collection Launch - Don&apos;t miss exclusive launch prices!
            </p>

            <CountdownTimer targetDate={nextEventDate} />

            <Button size="lg" variant="secondary">
              Set Reminder
            </Button>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-10">
            What Our Customers Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Office Manager',
                content: 'Bought 10 chairs during the live event. 40% cheaper than retail and quality is amazing!',
                rating: 5,
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'
              },
              {
                name: 'Michael Chen',
                role: 'Startup Founder',
                content: 'Being able to see the manufacturing process live gave me confidence. No middlemen!',
                rating: 5,
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
              },
              {
                name: 'Emily Rodriguez',
                role: 'Interior Designer',
                content: 'I can ask questions directly to the factory. This changed how I source furniture!',
                rating: 5,
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80'
              }
            ].map((testimonial, idx) => (
              <Card key={idx} className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-primary">⭐</span>
                  ))}
                </div>
                <p className="text-muted-foreground">&ldquo;{testimonial.content}&rdquo;</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-y border-border py-8 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl mb-2">✓</div>
              <p className="font-semibold text-foreground">Secure Payment</p>
              <p className="text-sm text-muted-foreground">SSL Encrypted</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🚚</div>
              <p className="font-semibold text-foreground">Free Shipping</p>
              <p className="text-sm text-muted-foreground">Orders over $500</p>
            </div>
            <div>
              <div className="text-3xl mb-2">↩️</div>
              <p className="font-semibold text-foreground">30-Day Returns</p>
              <p className="text-sm text-muted-foreground">Money back guarantee</p>
            </div>
            <div>
              <div className="text-3xl mb-2">⭐</div>
              <p className="font-semibold text-foreground">5-Year Warranty</p>
              <p className="text-sm text-muted-foreground">On all products</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card/30">
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
