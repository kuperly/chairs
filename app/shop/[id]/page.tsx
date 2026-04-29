import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/theme-toggle';

export default function ProductPage({ params }: { params: { id: string } }) {
  // Mock product data
  const product = {
    id: params.id,
    name: 'Executive Leather Office Chair',
    description: 'Premium ergonomic office chair with Italian leather upholstery, lumbar support, and adjustable armrests. Designed for professionals who spend long hours at their desk. This chair combines luxury with functionality.',
    price: 299.99,
    compareAtPrice: 449.99,
    imageUrls: [
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80',
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80',
      'https://images.unsplash.com/photo-1591825729269-caeb344f6df2?w=800&q=80',
      'https://images.unsplash.com/photo-1580480055226-13c68314c2aa?w=800&q=80'
    ],
    category: 'Chairs',
    manufacturer: 'Premium Office Co.',
    status: 'live',
    viewerCount: 234,
    stockQuantity: 47,
    rating: 4.9,
    reviews: 187,
    features: [
      'Genuine Italian leather upholstery',
      'Ergonomic lumbar support system',
      '360-degree swivel with smooth casters',
      'Adjustable height (18-22")',
      'Breathable mesh back panel',
      'Weight capacity: 300 lbs',
      '5-year manufacturer warranty',
      'Easy 15-minute assembly'
    ],
    specifications: {
      'Dimensions': '26" W x 26" D x 42-46" H',
      'Seat Height': '18-22" (adjustable)',
      'Weight': '45 lbs',
      'Material': 'Leather, Mesh, Steel, Foam',
      'Color Options': 'Black, Brown, White',
      'Assembly': 'Required (15 minutes)',
      'Weight Capacity': '300 lbs',
      'Warranty': '5 years'
    }
  };

  const savings = Math.round((1 - product.price / product.compareAtPrice) * 100);

  // Related products
  const relatedProducts = [
    {
      id: '7',
      name: 'Ergonomic Mesh Chair',
      price: 249.99,
      imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=300&q=80'
    },
    {
      id: '2',
      name: 'Standing Desk Pro',
      price: 599.99,
      imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=300&q=80'
    },
    {
      id: '4',
      name: 'Ergonomic Keyboard',
      price: 89.99,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&q=80'
    }
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
              <Link href="/shop" className="text-sm font-medium text-primary">
                ALL CHAIRS
              </Link>
              <Link href="#" className="text-sm font-medium text-foreground hover:text-primary">
                FACTORIES
              </Link>
              <Link href="#" className="text-sm font-medium text-foreground hover:text-primary">
                HOW IT WORKS
              </Link>
              <Link href="#" className="text-sm font-medium text-foreground hover:text-primary">
                ABOUT US
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button size="sm" variant="outline">Cart (0)</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Live Event Banner */}
      {product.status === 'live' && (
        <div className="bg-red-600 text-white py-3">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <Badge className="bg-white text-red-600 animate-pulse">🔴 LIVE</Badge>
                <span className="font-semibold">This product is on LIVE right now! <span className="font-bold">{product.viewerCount}</span> watching</span>
              </div>
              <Link href="/live">
                <Button size="sm" variant="secondary">
                  Watch Live →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-primary">Shop</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-primary">{product.category}</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                <Image
                  src={product.imageUrls[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
                {product.status === 'live' && (
                  <Badge className="absolute top-4 left-4 bg-red-600 text-white animate-pulse">
                    🔴 LIVE NOW
                  </Badge>
                )}
                {product.compareAtPrice && (
                  <Badge className="absolute top-4 right-4 bg-green-600 text-white text-lg px-4 py-2">
                    SAVE {savings}%
                  </Badge>
                )}
              </div>

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 gap-4">
                {product.imageUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:border-2 hover:border-primary transition-all">
                    <Image
                      src={url}
                      alt={`${product.name} view ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <Badge variant="secondary" className="mb-3">
                  {product.category}
                </Badge>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                  {product.name}
                </h1>
                <p className="text-muted-foreground">
                  by <Link href="#" className="text-primary hover:underline">{product.manufacturer}</Link>
                </p>
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(product.rating) ? 'text-primary text-lg' : 'text-muted-foreground text-lg'}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="font-semibold text-foreground">{product.rating}</span>
                </div>
                <span className="text-muted-foreground">
                  ({product.reviews} reviews)
                </span>
                <Link href="#reviews" className="text-primary hover:underline text-sm">
                  Write a review
                </Link>
              </div>

              {/* Price */}
              <div className="border-y border-border py-6 space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-bold text-primary">
                    ${product.price}
                  </span>
                  {product.compareAtPrice && (
                    <>
                      <span className="text-2xl text-muted-foreground line-through">
                        ${product.compareAtPrice}
                      </span>
                    </>
                  )}
                </div>
                {product.compareAtPrice && (
                  <p className="text-lg text-green-600 font-semibold">
                    You save ${(product.compareAtPrice - product.price).toFixed(2)} ({savings}% off)
                  </p>
                )}
              </div>

              {/* Live Info */}
              {product.status === 'live' && (
                <Card className="p-4 bg-red-600/10 border-red-600 border-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-foreground text-lg mb-1">
                        🔴 Live Event Active!
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Special pricing available only during this live event
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="text-primary font-semibold">{product.viewerCount}</span> people watching now
                      </p>
                    </div>
                    <Link href="/live">
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 whitespace-nowrap">
                        Join Live
                      </Button>
                    </Link>
                  </div>
                </Card>
              )}

              {/* Stock */}
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-green-600 text-green-600">
                  ✓ In Stock
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {product.stockQuantity} units available
                </span>
                {product.stockQuantity < 10 && (
                  <Badge variant="destructive">
                    ⚡ Low Stock!
                  </Badge>
                )}
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              {/* Add to Cart Section */}
              <div className="space-y-3 pt-4">
                <div className="flex gap-3">
                  <div className="flex items-center border border-border rounded-lg">
                    <Button variant="ghost" size="sm" className="px-3">-</Button>
                    <span className="px-4 font-semibold">1</span>
                    <Button variant="ghost" size="sm" className="px-3">+</Button>
                  </div>
                  <Button size="lg" className="flex-1 text-lg font-bold">
                    Add to Cart - ${product.price}
                  </Button>
                </div>
                <Button size="lg" variant="outline" className="w-full">
                  Buy Now - Skip Cart
                </Button>
              </div>

              {/* Trust Signals */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-xl">🚚</span>
                  <div>
                    <p className="font-semibold text-foreground">Free Shipping</p>
                    <p className="text-muted-foreground text-xs">Orders over $500</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-xl">↩️</span>
                  <div>
                    <p className="font-semibold text-foreground">30-Day Returns</p>
                    <p className="text-muted-foreground text-xs">Money back</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-xl">⭐</span>
                  <div>
                    <p className="font-semibold text-foreground">5-Year Warranty</p>
                    <p className="text-muted-foreground text-xs">Manufacturer</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-xl">✓</span>
                  <div>
                    <p className="font-semibold text-foreground">Secure Checkout</p>
                    <p className="text-muted-foreground text-xs">SSL encrypted</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Tabs */}
          <div className="mt-12">
            <Tabs defaultValue="features" className="w-full">
              <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0">
                <TabsTrigger value="features" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  Features
                </TabsTrigger>
                <TabsTrigger value="specs" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  Specifications
                </TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  Reviews ({product.reviews})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="features" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 border border-border rounded-lg hover:border-primary transition-colors">
                      <span className="text-primary text-xl mt-0.5">✓</span>
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="specs" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-border pb-3">
                      <dt className="font-semibold text-foreground">{key}:</dt>
                      <dd className="text-muted-foreground">{value}</dd>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary mb-2">{product.rating}</div>
                      <div className="flex justify-center mb-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < Math.floor(product.rating) ? 'text-primary text-lg' : 'text-muted-foreground text-lg'}>
                            ⭐
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">{product.reviews} reviews</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-muted-foreground mb-4">
                        Based on {product.reviews} verified customer reviews
                      </p>
                      <Button>Write a Review</Button>
                    </div>
                  </div>

                  {/* Sample reviews would go here */}
                  <p className="text-muted-foreground text-center py-8">
                    Reviews section - customer testimonials will be displayed here
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Related Products */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedProducts.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:border-primary transition-colors">
                  <Link href={`/shop/${item.id}`}>
                    <div className="relative aspect-square bg-muted">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground mb-2">{item.name}</h3>
                      <p className="text-2xl font-bold text-primary">${item.price}</p>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
