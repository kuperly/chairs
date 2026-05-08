'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Header } from '@/components/layout/Header';
import { useEvents, useLiveEvents } from '@/hooks/useEvents';
import { useProducts } from '@/hooks/useProducts';
import { useRecentOrders } from '@/hooks/useOrders';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  // Protect route
  const { loading: authLoading } = useProtectedRoute();

  // Fetch real data
  const { events: allEventsRaw, loading: eventsLoading } = useEvents({ limit: 100 });
  const { events: liveEventsRaw } = useLiveEvents();
  const { products: productsRaw, loading: productsLoading } = useProducts({ limit: 100 });
  const { orders: ordersRaw, loading: ordersLoading, total: totalOrders } = useRecentOrders(5);

  // Ensure data is always an array
  const allEvents = Array.isArray(allEventsRaw) ? allEventsRaw : [];
  const liveEvents = Array.isArray(liveEventsRaw) ? liveEventsRaw : [];
  const products = Array.isArray(productsRaw) ? productsRaw : [];
  const orders = Array.isArray(ordersRaw) ? ordersRaw : [];

  // Calculate stats from real data
  const stats = useMemo(() => {
    // Calculate total revenue from orders
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Count live events
    const liveCount = liveEvents.length;

    // Count low stock products (< 10)
    const lowStockCount = products.filter(p => p.stockQuantity < 10 && p.stockQuantity > 0).length;

    return [
      {
        label: 'Total Revenue',
        value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: `From ${totalOrders} orders`,
        loading: ordersLoading,
      },
      {
        label: 'Active Events',
        value: allEvents.length.toString(),
        change: liveCount > 0 ? `${liveCount} live now` : 'No live events',
        loading: eventsLoading,
      },
      {
        label: 'Total Orders',
        value: totalOrders.toString(),
        change: orders.length > 0 ? `${orders.length} recent` : 'No recent orders',
        loading: ordersLoading,
      },
      {
        label: 'Products',
        value: products.length.toString(),
        change: lowStockCount > 0 ? `${lowStockCount} low stock` : 'All stocked',
        loading: productsLoading,
      },
    ];
  }, [orders, ordersLoading, totalOrders, allEvents, eventsLoading, liveEvents, products, productsLoading]);

  // Filter upcoming events (scheduled or live)
  const upcomingEvents = useMemo(() => {
    return allEvents
      .filter(event => event.status === 'scheduled' || event.status === 'live')
      .slice(0, 3)
      .map(event => {
        const scheduledTime = new Date(event.scheduledStartTime);
        const now = new Date();
        const isToday = scheduledTime.toDateString() === now.toDateString();
        const isTomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString() === scheduledTime.toDateString();

        let dateStr = '';
        if (event.status === 'live') {
          dateStr = 'Live Now';
        } else if (isToday) {
          dateStr = `Today, ${scheduledTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
        } else if (isTomorrow) {
          dateStr = `Tomorrow, ${scheduledTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
        } else {
          dateStr = scheduledTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
        }

        return {
          id: event.id,
          title: event.title,
          date: dateStr,
          status: event.status,
        };
      });
  }, [allEvents]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back! Here&apos;s what&apos;s happening today.
            </p>
          </div>
          <Link href="/dashboard/events/create">
            <Button className="mt-4 sm:mt-0 bg-primary hover:bg-primary/90 text-black font-bold">
              Create Event
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <Card key={idx} className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {stat.label}
                </p>
                {stat.loading ? (
                  <div className="h-9 bg-muted animate-pulse rounded"></div>
                ) : (
                  <p className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                )}
                <p className="text-sm text-primary">
                  {stat.change}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                Recent Orders
              </h2>
              <Button variant="outline" size="sm" className="font-bold">
                View All
              </Button>
            </div>

            {ordersLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => {
                    // Get first product from order items
                    const firstItem = order.order_items?.[0];
                    const productName = firstItem?.productSnapshot?.name || 'Unknown Product';

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">
                              {order.customers?.fullName || 'Unknown'}
                            </p>
                            <p className="text-sm text-muted-foreground truncate max-w-[150px]">
                              {productName}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-primary font-semibold">
                          ${order.totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === 'paid' || order.status === 'delivered' ? 'default' :
                              order.status === 'shipped' || order.status === 'processing' ? 'secondary' :
                              'outline'
                            }
                            className={
                              order.status === 'paid' || order.status === 'delivered' ? 'bg-green-600' :
                              order.status === 'shipped' || order.status === 'processing' ? 'bg-blue-600' :
                              ''
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>

          {/* Upcoming Events */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                Upcoming Events
              </h2>
              <Link href="/dashboard/events">
                <Button variant="outline" size="sm" className="font-bold">
                  View All
                </Button>
              </Link>
            </div>

            {eventsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded"></div>
                ))}
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No upcoming events</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">
                          {event.title}
                        </h3>
                        {event.status === 'live' && (
                          <Badge className="bg-red-600 text-white animate-pulse">
                            🔴 LIVE
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {event.date}
                      </p>
                    </div>
                    <Link href={event.status === 'live' ? `/dashboard/broadcast/${event.id}` : '/dashboard/events'}>
                      <Button
                        size="sm"
                        variant={event.status === 'live' ? 'default' : 'outline'}
                        className={event.status === 'live' ? 'bg-red-600 hover:bg-red-700 text-white font-bold' : 'font-bold'}
                      >
                        {event.status === 'live' ? 'Enter Broadcast' : 'Manage'}
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Button variant="outline" className="h-24 flex-col gap-2 font-bold">
              <span className="text-3xl">📦</span>
              <span>Add Product</span>
            </Button>
            <Link href="/dashboard/events/create">
              <Button variant="outline" className="h-24 flex-col gap-2 font-bold w-full">
                <span className="text-3xl">📅</span>
                <span>Schedule Event</span>
              </Button>
            </Link>
            <Button variant="outline" className="h-24 flex-col gap-2 font-bold">
              <span className="text-3xl">📊</span>
              <span>View Analytics</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2 font-bold">
              <span className="text-3xl">⚙️</span>
              <span>Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
