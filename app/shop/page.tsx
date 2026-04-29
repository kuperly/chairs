import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function ShopPage() {
  // Mock products data
  const products = [
    {
      id: '1',
      name: 'Executive Office Chair',
      price: 299.99,
      compareAtPrice: 449.99,
      imageUrl: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500',
      category: 'Chairs',
      status: 'live',
      viewerCount: 234
    },
    {
      id: '2',
      name: 'Standing Desk Pro',
      price: 599.99,
      imageUrl: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500',
      category: 'Desks',
      status: 'upcoming',
      availableDate: '2 days'
    },
    {
      id: '3',
      name: 'Conference Table',
      price: 1299.99,
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500',
      category: 'Tables',
      status: 'purchase_window',
      unitsLeft: 12
    },
    {
      id: '4',
      name: 'Ergonomic Keyboard',
      price: 89.99,
      compareAtPrice: 129.99,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
      category: 'Accessories',
      status: 'live',
      viewerCount: 89
    },
    {
      id: '5',
      name: 'Monitor Arm',
      imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
      category: 'Accessories',
      status: 'ended'
    },
    {
      id: '6',
      name: 'File Cabinet',
      price: 199.99,
      imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500',
      category: 'Storage',
      status: 'purchase_window',
      unitsLeft: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              COLOSSEUM
            </Link>
            <nav className="hidden sm:flex gap-6">
              <Link href="/" className="text-foreground hover:text-primary">Home</Link>
              <Link href="/shop" className="text-primary">Shop</Link>
              <Link href="/live" className="text-foreground hover:text-primary">Live Now</Link>
              <Link href="/login" className="text-foreground hover:text-primary">Login</Link>
            </nav>
            <Button size="sm">Cart (0)</Button>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Product Catalog
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Browse our collection of premium office furniture. Join live events for exclusive deals!
          </p>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search products..."
              className="flex-1"
            />
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">All</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">Chairs</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">Desks</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">Tables</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-accent">Storage</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden group cursor-pointer hover:border-primary transition-colors">
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
                          ${product.price}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${product.compareAtPrice}
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
                        Only {product.unitsLeft} units left!
                      </p>
                    )}

                    {/* CTA Button */}
                    {product.status === 'live' && (
                      <Button className="w-full" size="sm">
                        WATCH LIVE
                      </Button>
                    )}
                    {product.status === 'purchase_window' && (
                      <Button className="w-full" size="sm">
                        BUY NOW
                      </Button>
                    )}
                    {product.status === 'upcoming' && (
                      <Button variant="outline" className="w-full" size="sm">
                        Get Notified
                      </Button>
                    )}
                    {product.status === 'ended' && (
                      <Button variant="secondary" className="w-full" size="sm" disabled>
                        Event Ended
                      </Button>
                    )}
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
