'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { Send } from 'lucide-react';
import { useState } from 'react';

export default function LivePage() {
  const [message, setMessage] = useState('');

  // Mock live event and products
  const liveEvent = {
    title: 'Premium Office Furniture Factory Tour',
    manufacturer: 'GLOBAL SEATING',
    factory: 'FACTORY 02',
    viewerCount: 892,
    featuredProducts: [
      {
        id: '1',
        name: 'Executive Office Chair',
        price: 299.99,
        compareAtPrice: 449.99,
        imageUrl: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=300&q=80'
      },
      {
        id: '2',
        name: 'Ergonomic Keyboard',
        price: 89.99,
        compareAtPrice: 129.99,
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&q=80'
      }
    ]
  };

  // Mock chat messages
  const chatMessages = [
    { id: 1, user: 'Avi from Israel', message: 'Amazing quality! 🔥', time: '2m ago' },
    { id: 2, user: 'Sarah M.', message: 'Does it come with a warranty?', time: '3m ago' },
    { id: 3, user: 'Mike R.', message: 'Just ordered one! Great deal!', time: '5m ago' },
    { id: 4, user: 'Daniel', message: 'Do you ship to Israel?', time: '6m ago' },
    { id: 5, user: 'LiveChairs Team', message: 'Yes! We ship worldwide 🌍', time: '6m ago' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
                <span className="text-2xl">🪑</span>
              </div>
              <div className="text-left">
                <div className="font-bold text-foreground text-lg">
                  LIVE<span className="text-primary">CHAIRS</span>
                </div>
                <div className="text-[10px] text-muted-foreground tracking-wide">FACTORY LIVE</div>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <Badge className="bg-red-600 text-white animate-pulse hidden sm:flex">
                🔴 LIVE NOW
              </Badge>
              <ThemeToggle />
              <Button size="sm" variant="outline">Cart (0)</Button>
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
            <Card className="relative aspect-video bg-black overflow-hidden border-2 border-primary/30">
              {/* Placeholder for video stream */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-black">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                    <div className="text-6xl">📹</div>
                  </div>
                  <p className="text-2xl font-bold text-white">Live Stream</p>
                  <Badge className="bg-red-600 text-white text-lg px-6 py-2 animate-pulse">
                    🔴 LIVE NOW
                  </Badge>
                  <p className="text-white/70 text-sm max-w-md mx-auto">
                    Video streaming will be integrated with Agora.io
                  </p>
                </div>
              </div>

              {/* Viewer Count Overlay */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-black/80 text-white backdrop-blur-sm px-3 py-1.5">
                  👥 {liveEvent.viewerCount.toLocaleString()} watching
                </Badge>
              </div>

              {/* Live Indicator */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-red-600 text-white animate-pulse px-3 py-1.5">
                  🔴 LIVE
                </Badge>
              </div>
            </Card>

            {/* Event Info */}
            <div className="space-y-4">
              <div>
                <Badge className="mb-2 text-xs">{liveEvent.factory}</Badge>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                  {liveEvent.manufacturer}
                </h1>
                <p className="text-lg text-muted-foreground mb-1">
                  {liveEvent.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  Ergonomic Mesh & Executive Chairs
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button className="bg-primary hover:bg-primary/90">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  Share Event
                </Button>
                <Button variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  Follow Factory
                </Button>
              </div>
            </div>

            {/* Featured Products */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">
                Featured Products in This Live
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {liveEvent.featuredProducts.map((product) => (
                  <Link key={product.id} href={`/shop/${product.id}`}>
                    <Card className="p-4 hover:border-primary transition-all hover:shadow-lg cursor-pointer">
                      <div className="flex gap-4">
                        <div className="relative w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h3 className="font-bold text-foreground mb-1">
                              {product.name}
                            </h3>
                            <div className="flex items-baseline gap-2 mb-2">
                              <span className="text-xl font-bold text-primary">
                                ${product.price}
                              </span>
                              <span className="text-sm text-muted-foreground line-through">
                                ${product.compareAtPrice}
                              </span>
                            </div>
                          </div>
                          <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Chat */}
          <div className="lg:col-span-1">
            <Card className="h-[600px] lg:h-[calc(100vh-12rem)] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-card">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-bold text-foreground">LIVE CHAT</h2>
                  <Badge variant="outline" className="text-xs">
                    ● {liveEvent.viewerCount} online
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ask questions, get answers in real-time
                </p>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-xs font-bold">
                        {msg.user.charAt(0)}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {msg.user}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {msg.time}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground ml-10">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-border bg-card">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="icon" className="bg-primary hover:bg-primary/90">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  💬 Chat powered by Agora RTM
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
