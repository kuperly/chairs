'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/layout/Header';;
import { useProducts, useProductCategories } from '@/hooks/useProducts';
import { useLiveEvents } from '@/hooks/useEvents';
import { useState } from 'react';

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch products with filters
  const { products: productsRaw, loading, error, total } = useProducts({
    category: selectedCategory,
    search: searchQuery,
    isActive: true,
    limit: 20,
  });

  // Fetch categories
  const { categories: categoriesRaw } = useProductCategories();

  // Check for live events
  const { events: liveEventsRaw } = useLiveEvents();
  const liveEvents = Array.isArray(liveEventsRaw) ? liveEventsRaw : [];
  const hasLiveEvent = liveEvents.length > 0;

  // Ensure data is always an array
  const products = Array.isArray(productsRaw) ? productsRaw : [];
  const categories = Array.isArray(categoriesRaw) ? categoriesRaw : [];

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
      <Header />


      {/* Live Event Banner - Only show when there's an active event */}
      {hasLiveEvent && liveEvents[0] && (
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-2 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Badge className="bg-white text-red-600 animate-pulse px-2 py-0.5 text-xs">🔴 LIVE</Badge>
                <span className="font-medium hidden sm:inline">{liveEvents[0].title}</span>
              </div>
              <Link href={`/live/${liveEvents[0].id}`}>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 h-7 text-xs">
                  Watch Now →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <section className="border-b border-border/50">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                Premium Office Furniture
              </h1>
              <p className="text-sm text-muted-foreground">
                {loading ? 'Loading...' : `Factory-direct prices on ${total} products. Up to 50% off retail!`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Sort by:</span>
              <Button variant="outline" size="sm" className="text-xs h-8">
                Price: Low to High
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="border-b border-border/50 bg-muted/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Search products..."
              className="flex-1 h-10 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="flex gap-2 flex-wrap">
              <Badge
                variant={!selectedCategory ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-xs font-medium transition-all ${
                  !selectedCategory
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    : 'hover:bg-accent border-border/40'
                }`}
                onClick={() => setSelectedCategory(undefined)}
              >
                All
              </Badge>
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 text-xs font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      : 'hover:bg-accent border-border/40'
                  }`}
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
      <section className="py-6 sm:py-10 bg-background">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {products.map((product) => {
                    const savingsPercent = getSavingsPercent(product.price, product.compareAtPrice);

                    return (
                      <Link key={product.id} href={`/shop/${product.id}`}>
                        <Card className="overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-300 h-full flex flex-col border-border/40 bg-card/50 backdrop-blur-sm">
                          {/* Product Image */}
                          <div className="relative aspect-[4/5] bg-white overflow-hidden">
                            <Image
                              src={product.imageUrls[0] || '/placeholder-product.jpg'}
                              alt={product.name}
                              fill
                              className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                            />

                            {/* Savings Badge - Top Right */}
                            {savingsPercent > 0 && (
                              <div className="absolute top-3 right-3 z-10">
                                <div className="bg-green-600 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-lg">
                                  Save {savingsPercent}%
                                </div>
                              </div>
                            )}

                            {/* Low Stock Warning */}
                            {product.stockQuantity > 0 && product.stockQuantity < 10 && (
                              <div className="absolute top-3 left-3 z-10">
                                <div className="bg-orange-500 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-lg">
                                  Only {product.stockQuantity} left!
                                </div>
                              </div>
                            )}

                            {/* Out of Stock Overlay */}
                            {product.stockQuantity === 0 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                                <div className="bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold">
                                  Out of Stock
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="p-4 flex flex-col flex-1 space-y-2">
                            {/* Category Badge */}
                            <Badge
                              variant="outline"
                              className="w-fit text-[10px] px-2 py-0.5 font-medium border-primary/20 text-primary/80"
                            >
                              {product.category}
                            </Badge>

                            {/* Product Name */}
                            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
                              {product.name}
                            </h3>

                            {/* Price Section */}
                            <div className="flex items-baseline gap-2 mt-auto pt-2">
                              <span className="text-xl font-bold text-primary">
                                ₪{product.price.toFixed(2)}
                              </span>
                              {product.compareAtPrice && (
                                <span className="text-xs text-muted-foreground line-through font-medium">
                                  ₪{product.compareAtPrice.toFixed(2)}
                                </span>
                              )}
                            </div>

                            {/* Stock Status */}
                            {product.stockQuantity > 0 && (
                              <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                In Stock
                              </div>
                            )}
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
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
