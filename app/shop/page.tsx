'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { useProducts, useProductCategories } from '@/hooks/useProducts';
import { useState } from 'react';

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch products with filters
  const { products, loading, error, total } = useProducts({
    category: selectedCategory,
    search: searchQuery,
    isActive: true,
    limit: 20,
  });

  // Fetch categories
  const { categories } = useProductCategories();

  // Calculate savings percentage
  const getSavingsPercent = (price: number, compareAt: number | null) => {
    if (!compareAt) return 0;
    return Math.round((1 - price / compareAt) * 100);
  };

  // Get product status based on live events (simplified for now)
  const getProductStatus = () => {
    // TODO: Integrate with live events to determine product status
    // For now, all active products are available
    return 'available';
  };

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

      {/* Live Event Banner - TODO: Fetch from API */}
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
                {loading ? 'Loading...' : `Factory-direct prices on ${total} products. Up to 50% off retail!`}
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="flex gap-2 flex-wrap">
              <Badge
                variant={!selectedCategory ? "default" : "outline"}
                className={`cursor-pointer ${!selectedCategory ? 'bg-primary' : 'hover:bg-accent'}`}
                onClick={() => setSelectedCategory(undefined)}
              >
                All
              </Badge>
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`cursor-pointer ${selectedCategory === category ? 'bg-primary' : 'hover:bg-accent'}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-muted-foreground">Loading products...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="text-red-500 text-lg mb-4">⚠️ Error loading products</div>
              <p className="text-muted-foreground">{error.message}</p>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && (
            <>
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden group cursor-pointer hover:border-primary hover:shadow-xl transition-all">
                      <Link href={`/shop/${product.id}`}>
                        {/* Product Image */}
                        <div className="relative aspect-square bg-muted">
                          <Image
                            src={product.imageUrls[0] || '/placeholder-product.jpg'}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />

                          {/* Savings Badge */}
                          {product.compareAtPrice && (
                            <Badge className="absolute top-2 right-2 bg-green-600 text-white">
                              Save {getSavingsPercent(product.price, product.compareAtPrice)}%
                            </Badge>
                          )}

                          {/* Low Stock Warning */}
                          {product.stockQuantity > 0 && product.stockQuantity < 10 && (
                            <Badge className="absolute top-2 left-2 bg-orange-600 text-white">
                              Only {product.stockQuantity} left!
                            </Badge>
                          )}

                          {/* Out of Stock */}
                          {product.stockQuantity === 0 && (
                            <Badge className="absolute top-2 left-2 bg-gray-600 text-white">
                              Out of Stock
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

                          {/* Price */}
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

                          {/* Stock Status */}
                          {product.stockQuantity > 0 ? (
                            <p className="text-sm text-green-600 font-semibold">
                              ✓ In Stock
                            </p>
                          ) : (
                            <p className="text-sm text-red-600 font-semibold">
                              ✗ Out of Stock
                            </p>
                          )}

                          {/* CTA Button */}
                          <Button
                            className="w-full bg-primary hover:bg-primary/90 text-black font-bold"
                            size="sm"
                            disabled={product.stockQuantity === 0}
                          >
                            {product.stockQuantity > 0 ? 'BUY NOW' : 'Notify Me'}
                          </Button>
                        </div>
                      </Link>
                    </Card>
                  ))}
                </div>
              )}

              {/* Load More - TODO: Implement pagination */}
              {products.length > 0 && products.length < total && (
                <div className="text-center mt-12">
                  <Button size="lg" variant="outline" className="font-bold">
                    Load More Products
                  </Button>
                </div>
              )}
            </>
          )}
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
