import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';

export default function ShopPage() {
  // Expanded product catalog
  const products = [
    {
      id: '1',
      name: 'Executive Leather Office Chair',
      price: 299.99,
      compareAtPrice: 449.99,
      imageUrl: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500&q=80',
      category: 'Chairs',
      status: 'live',
      viewerCount: 234,
      rating: 4.9,
      reviews: 187
    },
    {
      id: '2',
      name: 'Electric Standing Desk Pro',
      price: 599.99,
      compareAtPrice: 799.99,
      imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500&q=80',
      category: 'Desks',
      status: 'live',
      viewerCount: 156,
      rating: 4.8,
      reviews: 203
    },
    {
      id: '3',
      name: 'Large Conference Table',
      price: 1299.99,
      compareAtPrice: 1799.99,
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80',
      category: 'Tables',
      status: 'purchase_window',
      unitsLeft: 5,
      rating: 4.9,
      reviews: 89
    },
    {
      id: '4',
      name: 'Ergonomic Wireless Keyboard',
      price: 89.99,
      compareAtPrice: 129.99,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80',
      category: 'Accessories',
      status: 'live',
      viewerCount: 89,
      rating: 4.7,
      reviews: 312
    },
    {
      id: '5',
      name: 'Dual Monitor Arm Mount',
      price: 149.99,
      imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80',
      category: 'Accessories',
      status: 'ended',
      rating: 4.6,
      reviews: 145
    },
    {
      id: '6',
      name: 'Modern File Cabinet',
      price: 199.99,
      compareAtPrice: 279.99,
      imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&q=80',
      category: 'Storage',
      status: 'purchase_window',
      unitsLeft: 3,
      rating: 4.8,
      reviews: 76
    },
    {
      id: '7',
      name: 'Ergonomic Mesh Chair',
      price: 249.99,
      compareAtPrice: 399.99,
      imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&q=80',
      category: 'Chairs',
      status: 'live',
      viewerCount: 198,
      rating: 4.9,
      reviews: 267
    },
    {
      id: '8',
      name: 'L-Shaped Gaming Desk',
      price: 449.99,
      compareAtPrice: 599.99,
      imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&q=80',
      category: 'Desks',
      status: 'upcoming',
      availableDate: '2 days',
      rating: 4.7,
      reviews: 134
    },
    {
      id: '9',
      name: 'Adjustable Laptop Stand',
      price: 59.99,
      compareAtPrice: 89.99,
      imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80',
      category: 'Accessories',
      status: 'purchase_window',
      unitsLeft: 12,
      rating: 4.5,
      reviews: 423
    }
  ];

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

            <nav className="hidden lg:flex items-center gap-8">
              <Link href="/live" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                LIVE SHOWS
              </Link>
              <Link href="/shop" className="text-sm font-semibold text-primary">
                ALL CHAIRS
              </Link>
              <Link href="/dashboard" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                FACTORIES
              </Link>
              <Link href="/#how-it-works" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                HOW IT WORKS
              </Link>
              <Link href="#" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                ABOUT US
              </Link>
            </nav>

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
              <Button size="sm" variant="outline">Cart (0)</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Live Event Banner */}
      <div className="bg-red-600 text-white py-3">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <Badge className="bg-white text-red-600 animate-pulse">🔴 LIVE</Badge>
              <span className="font-semibold">Office Chair Factory Tour - Special Prices Now!</span>
            </div>
            <Link href="/live">
              <Button size="sm" className="bg-white text-black font-bold hover:bg-white/90">
                Watch Live →
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Premium Office Furniture
              </h1>
              <p className="text-muted-foreground">
                Factory-direct prices on {products.length} products. Up to 50% off retail!
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Button variant="outline" size="sm">Price: Low to High</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search products..."
              className="flex-1"
            />
            <div className="flex gap-2 flex-wrap">
              <Badge variant="default" className="cursor-pointer bg-primary">All</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">Chairs</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">Desks</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">Tables</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">Storage</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">Accessories</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden group cursor-pointer hover:border-primary hover:shadow-xl transition-all">
                <Link href={`/shop/${product.id}`}>
                  {/* Product Image */}
                  <div className="relative aspect-square bg-muted">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />

                    {/* Status Badge */}
                    {product.status === 'live' && (
                      <Badge className="absolute top-2 left-2 bg-red-600 text-white animate-pulse">
                        🔴 LIVE
                      </Badge>
                    )}
                    {product.status === 'upcoming' && (
                      <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
                        Coming Soon
                      </Badge>
                    )}
                    {product.status === 'purchase_window' && (
                      <Badge className="absolute top-2 left-2 bg-orange-600 text-white">
                        Last Chance!
                      </Badge>
                    )}

                    {/* Savings Badge */}
                    {product.compareAtPrice && (
                      <Badge className="absolute top-2 right-2 bg-green-600 text-white">
                        Save {Math.round((1 - product.price / product.compareAtPrice) * 100)}%
                      </Badge>
                    )}

                    {/* Quick View on Hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button className="bg-primary hover:bg-primary/90 text-black font-bold">
                        Quick View
                      </Button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {product.category}
                      </Badge>
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </div>

                    {/* Rating */}
                    {product.rating && (
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < Math.floor(product.rating) ? 'text-primary' : 'text-muted-foreground'}>
                              ⭐
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {product.rating} ({product.reviews} reviews)
                        </span>
                      </div>
                    )}

                    {/* Price or Status */}
                    {product.status === 'ended' ? (
                      <p className="text-sm text-muted-foreground italic">
                        Price revealed during live event
                      </p>
                    ) : product.status === 'upcoming' ? (
                      <p className="text-sm text-muted-foreground">
                        Available in {product.availableDate}
                      </p>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-primary">
                          ₪{product.price.toLocaleString()}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₪{product.compareAtPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action Info */}
                    {product.status === 'live' && product.viewerCount && (
                      <p className="text-sm text-muted-foreground">
                        <span className="text-primary font-semibold">{product.viewerCount}</span> watching now
                      </p>
                    )}
                    {product.status === 'purchase_window' && product.unitsLeft && (
                      <p className="text-sm text-orange-500 font-semibold">
                        ⚡ Only {product.unitsLeft} units left!
                      </p>
                    )}

                    {/* CTA Button */}
                    {product.status === 'live' && (
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold" size="sm">
                        WATCH LIVE & BUY
                      </Button>
                    )}
                    {product.status === 'purchase_window' && (
                      <Button className="w-full bg-primary hover:bg-primary/90 text-black font-bold" size="sm">
                        BUY NOW
                      </Button>
                    )}
                    {product.status === 'upcoming' && (
                      <Button variant="outline" className="w-full font-bold" size="sm">
                        Get Notified
                      </Button>
                    )}
                    {product.status === 'ended' && (
                      <Button variant="secondary" className="w-full font-bold" size="sm" disabled>
                        Event Ended
                      </Button>
                    )}
                  </div>
                </Link>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" className="font-bold">
              Load More Products
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="border-t border-border py-8 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl mb-2">🚚</div>
              <p className="font-semibold">WORLDWIDE SHIPPING</p>
              <p className="text-sm text-white/70">Fast & Safe Delivery</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🛡️</div>
              <p className="font-semibold">30-DAY WARRANTY</p>
              <p className="text-sm text-white/70">Quality Guaranteed</p>
            </div>
            <div>
              <div className="text-3xl mb-2">💳</div>
              <p className="font-semibold">SECURE PAYMENTS</p>
              <p className="text-sm text-white/70">100% Protected</p>
            </div>
            <div>
              <div className="text-3xl mb-2">💬</div>
              <p className="font-semibold">24/7 SUPPORT</p>
              <p className="text-sm text-white/70">We're Here to Help</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
