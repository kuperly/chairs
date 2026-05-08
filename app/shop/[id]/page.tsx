'use client';

import { useState } from 'react';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/layout/Header';
import { useCartProtection } from '@/hooks/useCartProtection';
import { useCart } from '@/lib/cart/context';
import { useProduct, useProducts } from '@/hooks/useProducts';

export default function ProductPage({ params }: { params: { id: string } }) {
  const { product, loading, error } = useProduct(params.id);

  // Fetch related products (same category)
  const { products: relatedProductsRaw } = useProducts({
    category: product?.category,
    isActive: true,
    limit: 3,
  });

  const { handleAddToCart, canAddToCart } = useCartProtection();
  const { addItem, isInCart, getItemQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Ensure related products is always an array
  const relatedProducts = Array.isArray(relatedProductsRaw) ? relatedProductsRaw : [];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-2xl mb-4">⚠️</p>
          <h1 className="text-2xl font-bold text-foreground mb-2">Error Loading Product</h1>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <Link href="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Not found state
  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-6xl mb-4">🔍</p>
          <h1 className="text-2xl font-bold text-foreground mb-2">Product Not Found</h1>
          <p className="text-muted-foreground mb-4">
            We couldn't find the product you're looking for.
          </p>
          <Link href="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate savings if compareAtPrice exists
  const savings = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;

  // Mock data for features not yet in database (POC)
  const mockFeatures = [
    'Premium quality materials',
    'Ergonomic design',
    'Durable construction',
    'Easy assembly',
    'Modern styling',
    'Multiple color options',
    'Manufacturer warranty',
    'Tested for quality'
  ];

  const mockSpecs = {
    'Manufacturer': product.manufacturers?.companyName || 'N/A',
    'Category': product.category,
    'Stock': `${product.stockQuantity} units`,
    'Status': product.isActive ? 'Active' : 'Inactive',
  };

  // Filter out current product from related products
  const filteredRelated = relatedProducts.filter(p => p.id !== product.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Header />

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
                  src={product.imageUrls[0] || '/placeholder.png'}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
                {product.compareAtPrice && (
                  <Badge className="absolute top-4 right-4 bg-green-600 text-white text-lg px-4 py-2">
                    SAVE {savings}%
                  </Badge>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {product.imageUrls.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.imageUrls.slice(0, 4).map((url, idx) => (
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
              )}
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
                {product.manufacturers && (
                  <p className="text-muted-foreground">
                    by <span className="text-primary">{product.manufacturers.companyName}</span>
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="border-y border-border py-6 space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-2xl text-muted-foreground line-through">
                      ${product.compareAtPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                {product.compareAtPrice && (
                  <p className="text-lg text-green-600 font-semibold">
                    You save ${(product.compareAtPrice - product.price).toFixed(2)} ({savings}% off)
                  </p>
                )}
              </div>

              {/* Stock */}
              <div className="flex items-center gap-3">
                {product.stockQuantity > 0 ? (
                  <>
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
                  </>
                ) : (
                  <Badge variant="destructive">
                    ✗ Out of Stock
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
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="px-3"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >-</Button>
                    <span className="px-4 font-semibold">{quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="px-3"
                      onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    >+</Button>
                  </div>
                  <Button
                    size="lg"
                    className="flex-1 text-lg font-bold"
                    disabled={product.stockQuantity === 0}
                    onClick={() => handleAddToCart(() => {
                      addItem({
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        imageUrl: product.imageUrls[0] || '/placeholder.png',
                        maxStock: product.stockQuantity,
                      }, quantity);
                      alert(`Added ${quantity} item(s) to cart!`);
                    })}
                  >
                    {product.stockQuantity > 0 ? (canAddToCart ? `Add to Cart - $${product.price.toFixed(2)}` : 'Login to Buy') : 'Out of Stock'}
                  </Button>
                </div>
                {product.stockQuantity > 0 && (
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleAddToCart(() => {
                      addItem({
                        productId: product.id,
                        name: product.name,
                        price: product.price,
                        imageUrl: product.imageUrls[0] || '/placeholder.png',
                        maxStock: product.stockQuantity,
                      }, quantity);
                      window.location.href = '/checkout';
                    })}
                  >
                    {canAddToCart ? 'Buy Now - Skip Cart' : 'Login to Buy'}
                  </Button>
                )}
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
                    <p className="font-semibold text-foreground">Quality Guarantee</p>
                    <p className="text-muted-foreground text-xs">Verified quality</p>
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
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0">
                <TabsTrigger value="description" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  Description
                </TabsTrigger>
                <TabsTrigger value="features" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  Features
                </TabsTrigger>
                <TabsTrigger value="specs" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                  Specifications
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-6">
                <div className="prose prose-gray max-w-none">
                  <p className="text-foreground leading-relaxed">{product.description}</p>
                </div>
              </TabsContent>

              <TabsContent value="features" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockFeatures.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 border border-border rounded-lg hover:border-primary transition-colors">
                      <span className="text-primary text-xl mt-0.5">✓</span>
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="specs" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {Object.entries(mockSpecs).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-border pb-3">
                      <dt className="font-semibold text-foreground">{key}:</dt>
                      <dd className="text-muted-foreground">{value}</dd>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Related Products */}
          {filteredRelated.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                You May Also Like
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {filteredRelated.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:border-primary transition-colors">
                    <Link href={`/shop/${item.id}`}>
                      <div className="relative aspect-square bg-muted">
                        <Image
                          src={item.imageUrls[0] || '/placeholder.png'}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground mb-2">{item.name}</h3>
                        <p className="text-2xl font-bold text-primary">${item.price.toFixed(2)}</p>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
