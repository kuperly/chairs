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
import { toast } from 'sonner';
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

      {/* Product Details */}
      <section className="py-6 sm:py-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-border/40 shadow-sm">
                <Image
                  src={product.imageUrls[0] || '/placeholder.png'}
                  alt={product.name}
                  fill
                  className="object-contain p-8"
                  priority
                />
                {product.compareAtPrice && (
                  <Badge className="absolute top-6 right-6 bg-green-600 text-white text-base px-5 py-2 shadow-lg">
                    SAVE {savings}%
                  </Badge>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {product.imageUrls.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.imageUrls.slice(0, 4).map((url, idx) => (
                    <div key={idx} className="relative aspect-square bg-white rounded-lg overflow-hidden cursor-pointer border border-border/40 hover:border-primary transition-all shadow-sm hover:shadow-md">
                      <Image
                        src={url}
                        alt={`${product.name} view ${idx + 1}`}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6 lg:pt-4">
              <div>
                <Badge variant="outline" className="mb-3 border-primary/30 text-primary">
                  {product.category}
                </Badge>
                <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-3 leading-tight">
                  {product.name}
                </h1>
                {product.manufacturers && (
                  <p className="text-base text-muted-foreground">
                    by <span className="text-primary font-semibold">{product.manufacturers.companyName}</span>
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="bg-muted/30 rounded-xl p-6 space-y-2">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl sm:text-6xl font-bold text-primary">
                    ₪{product.price.toFixed(2)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-2xl text-muted-foreground line-through">
                      ₪{product.compareAtPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                {product.compareAtPrice && (
                  <p className="text-base text-green-600 font-semibold">
                    You save ₪{(product.compareAtPrice - product.price).toFixed(2)} ({savings}% off retail price)
                  </p>
                )}
              </div>

              {/* Stock */}
              <div className="flex items-center gap-3 flex-wrap">
                {product.stockQuantity > 0 ? (
                  <>
                    <Badge variant="outline" className="border-green-600 text-green-600 font-semibold px-3 py-1">
                      ✓ In Stock
                    </Badge>
                    <span className="text-sm font-medium text-muted-foreground">
                      {product.stockQuantity} units available
                    </span>
                    {product.stockQuantity < 10 && (
                      <Badge variant="destructive" className="font-semibold px-3 py-1">
                        ⚡ Low Stock!
                      </Badge>
                    )}
                  </>
                ) : (
                  <Badge variant="destructive" className="font-semibold px-3 py-1">
                    ✗ Out of Stock
                  </Badge>
                )}
              </div>

              {/* Description */}
              <div className="bg-card/50 rounded-xl p-6 border border-border/40">
                <h3 className="text-lg font-semibold text-foreground mb-3">Product Description</h3>
                <p className="text-muted-foreground leading-relaxed text-base">
                  {product.description}
                </p>
              </div>

              {/* Add to Cart Section */}
              <div className="space-y-3 pt-2">
                {canAddToCart ? (
                  // Logged in customers see both buttons
                  <>
                    <div className="flex gap-4">
                      <div className="flex items-center border-2 border-border rounded-xl bg-background h-14">
                        <Button
                          variant="ghost"
                          size="lg"
                          className="px-5 h-full hover:bg-muted"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                          <span className="text-xl font-bold">−</span>
                        </Button>
                        <span className="px-6 font-bold text-lg min-w-[3rem] text-center">{quantity}</span>
                        <Button
                          variant="ghost"
                          size="lg"
                          className="px-5 h-full hover:bg-muted"
                          onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                        >
                          <span className="text-xl font-bold">+</span>
                        </Button>
                      </div>
                      <Button
                        size="lg"
                        className="flex-1 text-lg font-bold h-14 shadow-md hover:shadow-lg transition-shadow"
                        disabled={product.stockQuantity === 0}
                        onClick={() => handleAddToCart(() => {
                          addItem({
                            productId: product.id,
                            name: product.name,
                            price: product.price,
                            imageUrl: product.imageUrls[0] || '/placeholder.png',
                            maxStock: product.stockQuantity,
                          }, quantity);
                          toast.success(`Added ${quantity} item(s) to cart!`);
                        })}
                      >
                        {product.stockQuantity > 0 ? `Add to Cart - ₪${(product.price * quantity).toFixed(2)}` : 'Out of Stock'}
                      </Button>
                    </div>
                    {product.stockQuantity > 0 && (
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full h-14 text-base font-bold border-2 hover:bg-primary hover:text-primary-foreground transition-colors"
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
                        Buy Now - Express Checkout
                      </Button>
                    )}
                  </>
                ) : (
                  // Not logged in - single login button
                  <Button
                    size="lg"
                    className="w-full text-lg font-bold h-14 shadow-md hover:shadow-lg transition-shadow"
                    onClick={() => handleAddToCart(() => {})}
                  >
                    Login to Buy
                  </Button>
                )}
              </div>

              {/* Trust Signals */}
              <div className="grid grid-cols-2 gap-4 pt-6 pb-2 border-t border-border/40">
                <div className="flex items-center gap-3 p-3 bg-card/30 rounded-lg">
                  <span className="text-2xl">🚚</span>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Free Shipping</p>
                    <p className="text-muted-foreground text-xs">Orders over ₪500</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-card/30 rounded-lg">
                  <span className="text-2xl">↩️</span>
                  <div>
                    <p className="font-semibold text-foreground text-sm">30-Day Returns</p>
                    <p className="text-muted-foreground text-xs">Money back guarantee</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-card/30 rounded-lg">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Quality Guarantee</p>
                    <p className="text-muted-foreground text-xs">Certified products</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-card/30 rounded-lg">
                  <span className="text-2xl">✓</span>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Secure Checkout</p>
                    <p className="text-muted-foreground text-xs">SSL encrypted</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Tabs */}
          <div className="mt-16 border-t border-border/40 pt-12">
            <Tabs defaultValue="description" className="w-full flex flex-col">
              <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0 h-auto gap-1">
                <TabsTrigger value="description" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-8 py-4 text-base font-semibold">
                  Description
                </TabsTrigger>
                <TabsTrigger value="features" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-8 py-4 text-base font-semibold">
                  Features
                </TabsTrigger>
                <TabsTrigger value="specs" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-8 py-4 text-base font-semibold">
                  Specifications
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-8">
                <div className="max-w-4xl">
                  <div className="space-y-8">
                    <p className="text-foreground leading-relaxed text-lg">
                      {product.description}
                    </p>

                    <div className="bg-muted/30 rounded-xl p-8 border border-border/40">
                      <h3 className="text-2xl font-bold text-foreground mb-6">Product Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <dt className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Manufacturer</dt>
                          <dd className="text-lg text-foreground font-semibold">{product.manufacturers?.companyName || 'N/A'}</dd>
                        </div>
                        <div className="space-y-2">
                          <dt className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Category</dt>
                          <dd className="text-lg text-foreground font-semibold">{product.category}</dd>
                        </div>
                        <div className="space-y-2">
                          <dt className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Stock Status</dt>
                          <dd className="text-lg text-foreground font-semibold">
                            {product.isActive ? (product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock') : 'Inactive'}
                          </dd>
                        </div>
                        <div className="space-y-2">
                          <dt className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Available Quantity</dt>
                          <dd className="text-lg text-foreground font-semibold">{product.stockQuantity} units</dd>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="features" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
                  {mockFeatures.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-5 bg-card/50 border border-border/40 rounded-xl hover:border-primary transition-all hover:shadow-sm">
                      <span className="text-primary text-2xl mt-0.5">✓</span>
                      <span className="text-foreground text-base font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="specs" className="mt-8">
                <div className="bg-card/50 rounded-xl border border-border/40 overflow-hidden max-w-4xl">
                  <div className="divide-y divide-border/40">
                    {Object.entries(mockSpecs).map(([key, value]) => (
                      <div key={key} className="flex justify-between p-5 hover:bg-muted/30 transition-colors">
                        <dt className="font-bold text-foreground text-base">{key}</dt>
                        <dd className="text-muted-foreground font-medium text-base">{value}</dd>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Related Products */}
          {filteredRelated.length > 0 && (
            <div className="mt-20 border-t border-border/40 pt-16">
              <h2 className="text-3xl font-bold text-foreground mb-8">
                You May Also Like
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {filteredRelated.map((item) => {
                  const relatedSavings = item.compareAtPrice
                    ? Math.round((1 - item.price / item.compareAtPrice) * 100)
                    : 0;

                  return (
                    <Link key={item.id} href={`/shop/${item.id}`}>
                      <Card className="overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-300 h-full flex flex-col border-border/40 bg-card/50 backdrop-blur-sm">
                        <div className="relative aspect-square bg-white overflow-hidden">
                          <Image
                            src={item.imageUrls[0] || '/placeholder.png'}
                            alt={item.name}
                            fill
                            className="object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                          />
                          {relatedSavings > 0 && (
                            <div className="absolute top-3 right-3 z-10">
                              <div className="bg-green-600 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-lg">
                                Save {relatedSavings}%
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <Badge variant="outline" className="w-fit text-[10px] px-2 py-0.5 font-medium border-primary/20 text-primary/80 mb-2">
                            {item.category}
                          </Badge>
                          <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem] mb-3">
                            {item.name}
                          </h3>
                          <div className="flex items-baseline gap-2 mt-auto">
                            <span className="text-2xl font-bold text-primary">
                              ₪{item.price.toFixed(2)}
                            </span>
                            {item.compareAtPrice && (
                              <span className="text-sm text-muted-foreground line-through font-medium">
                                ₪{item.compareAtPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
