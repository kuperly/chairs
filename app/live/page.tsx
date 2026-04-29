import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function LivePage() {
  // Mock live event and products
  const liveEvent = {
    title: 'Premium Office Furniture Factory Tour',
    manufacturer: 'Premium Office Co.',
    viewerCount: 2847,
    featuredProducts: [
      {
        id: '1',
        name: 'Executive Office Chair',
        price: 299.99,
        compareAtPrice: 449.99,
        imageUrl: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=300'
      },
      {
        id: '4',
        name: 'Ergonomic Keyboard',
        price: 89.99,
        compareAtPrice: 129.99,
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300'
      }
    ]
  };

  // Mock chat messages
  const chatMessages = [
    { id: 1, user: 'John D.', message: 'What colors are available?', time: '2m ago' },
    { id: 2, user: 'Sarah M.', message: 'Does it come with a warranty?', time: '3m ago' },
    { id: 3, user: 'Mike R.', message: 'Just ordered one! Great deal!', time: '5m ago' },
    { id: 4, user: 'Lisa K.', message: 'Shipping to Europe?', time: '7m ago' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              COLOSSEUM
            </Link>
            <div className="flex items-center gap-4">
              <Badge className="bg-red-600 text-white animate-pulse hidden sm:flex">
                🔴 LIVE NOW
              </Badge>
              <Button size="sm">Cart (0)</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Video + Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {/* Placeholder for video stream */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-background">
                <div className="text-center space-y-4">
                  <div className="text-6xl">📹</div>
                  <p className="text-2xl font-bold text-foreground">Live Stream</p>
                  <Badge className="bg-red-600 text-white text-lg px-6 py-2 animate-pulse">
                    🔴 LIVE
                  </Badge>
                  <p className="text-muted-foreground">
                    Video player will be integrated with Agora.io
                  </p>
                </div>
              </div>

              {/* Viewer Count Overlay */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-black/80 text-white backdrop-blur">
                  👥 {liveEvent.viewerCount.toLocaleString()} watching
                </Badge>
              </div>

              {/* Live Indicator */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-red-600 text-white animate-pulse">
                  🔴 LIVE
                </Badge>
              </div>
            </div>

            {/* Event Info */}
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  {liveEvent.title}
                </h1>
                <p className="text-muted-foreground">
                  Hosted by <span className="text-primary font-semibold">{liveEvent.manufacturer}</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button>Share Event</Button>
                <Button variant="outline">Follow Manufacturer</Button>
              </div>
            </div>

            {/* Featured Products */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">
                Featured Products
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {liveEvent.featuredProducts.map((product) => (
                  <Card key={product.id} className="p-4 hover:border-primary transition-colors cursor-pointer">
                    <Link href={`/shop/${product.id}`}>
                      <div className="flex gap-4">
                        <div className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-foreground truncate mb-1">
                            {product.name}
                          </h3>
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-primary">
                              ${product.price}
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              ${product.compareAtPrice}
                            </span>
                          </div>
                          <Button size="sm" className="mt-2 w-full">
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Chat */}
          <div className="lg:col-span-1">
            <Card className="h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-border">
                <h2 className="font-bold text-foreground">Live Chat</h2>
                <p className="text-sm text-muted-foreground">
                  {liveEvent.viewerCount.toLocaleString()} participants
                </p>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-sm text-primary">
                        {msg.user}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {msg.time}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input placeholder="Type a message..." />
                  <Button>Send</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Chat will be integrated with Agora RTM
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
