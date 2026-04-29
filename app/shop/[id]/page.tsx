import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProductPage({ params }: { params: { id: string } }) {
  // Mock product data
  const product = {
    id: params.id,
    name: 'Executive Office Chair',
    description: 'Premium ergonomic office chair with lumbar support, adjustable armrests, and breathable mesh back. Perfect for long working hours.',
    price: 299.99,
    compareAtPrice: 449.99,
    imageUrls: [
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800',
      'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800',
      'https://images.unsplash.com/photo-1591825729269-caeb344f6df2?w=800'
    ],
    category: 'Chairs',
    manufacturer: 'Premium Office Co.',
    status: 'live',
    viewerCount: 234,
    stockQuantity: 47,
    features: [
      'Ergonomic lumbar support',
      '360-degree swivel',
      'Adjustable height (18-22")',
      'Breathable mesh back',
      'Weight capacity: 300 lbs',
      '5-year warranty'
    ],
    specifications: {
      'Dimensions': '26" W x 26" D x 42-46" H',
      'Weight': '45 lbs',
      'Material': 'Mesh, Steel, Foam',
      'Color': 'Black',
      'Assembly': 'Required (15 minutes)'
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              COLOSSEUM
            </Link>
            <nav className="hidden sm:flex gap-6">
              <Link href="/" className="text-foreground hover:text-primary">Home</Link>
              <Link href="/shop" className="text-primary">Shop</Link>
              <Link href="/live" className="text-foreground hover:text-primary">Live Now</Link>
            </nav>
            <Button size="sm">Cart (0)</Button>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-primary">Shop</Link>
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
              </div>

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-3 gap-4">
                {product.imageUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:border-2 hover:border-primary">
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
                  by <span className="text-primary">{product.manufacturer}</span>
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary">
                  ${product.price}
                </span>
                {product.compareAtPrice && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      ${product.compareAtPrice}
                    </span>
                    <Badge variant="destructive" className="bg-red-600">
                      Save {Math.round((1 - product.price / product.compareAtPrice) * 100)}%
                    </Badge>
                  </>
                )}
              </div>

              {/* Live Info */}
              {product.status === 'live' && (
                <Card className="p-4 bg-red-600/10 border-red-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">Live Event Active!</p>
                      <p className="text-sm text-muted-foreground">
                        <span className="text-primary font-semibold">{product.viewerCount}</span> watching now
                      </p>
                    </div>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">
                      Join Live
                    </Button>
                  </div>
                </Card>
              )}

              {/* Stock */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-green-600 text-green-600">
                  In Stock
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {product.stockQuantity} units available
                </span>
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              {/* Add to Cart */}
              <div className="space-y-3">
                <Button size="lg" className="w-full text-lg font-bold">
                  Add to Cart - ${product.price}
                </Button>
                <Button size="lg" variant="outline" className="w-full">
                  Buy Now
                </Button>
              </div>

              {/* Details Tabs */}
              <Tabs defaultValue="features" className="mt-8">
                <TabsList className="w-full">
                  <TabsTrigger value="features" className="flex-1">Features</TabsTrigger>
                  <TabsTrigger value="specs" className="flex-1">Specifications</TabsTrigger>
                </TabsList>
                <TabsContent value="features" className="mt-4">
                  <ul className="space-y-2">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-primary mt-1">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
                <TabsContent value="specs" className="mt-4">
                  <dl className="space-y-3">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b border-border pb-2">
                        <dt className="font-semibold text-foreground">{key}:</dt>
                        <dd className="text-muted-foreground">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
