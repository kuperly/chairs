import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ThemeToggle } from '@/components/theme-toggle';

export default function DashboardPage() {
  // Mock data
  const stats = [
    { label: 'Total Revenue', value: '₪145,231', change: '+20.1% from last month' },
    { label: 'Active Events', value: '3', change: '2 live now' },
    { label: 'Total Orders', value: '124', change: '+12 this week' },
    { label: 'Products', value: '48', change: '8 low stock' }
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: 'John Doe', product: 'Executive Chair', amount: 890, status: 'paid' },
    { id: 'ORD-002', customer: 'Sarah Miller', product: 'Standing Desk', amount: 1599, status: 'processing' },
    { id: 'ORD-003', customer: 'Mike Ross', product: 'Keyboard', amount: 299, status: 'paid' },
    { id: 'ORD-004', customer: 'Lisa Kim', product: 'Monitor Arm', amount: 449, status: 'shipped' }
  ];

  const upcomingEvents = [
    { id: '1', title: 'Office Chair Showcase', date: 'Today, 2:00 PM', status: 'live' },
    { id: '2', title: 'Desk Collection Launch', date: 'Tomorrow, 10:00 AM', status: 'scheduled' },
    { id: '3', title: 'Ergonomic Accessories', date: 'Dec 5, 3:00 PM', status: 'scheduled' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
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
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/dashboard" className="text-primary font-semibold text-sm">Dashboard</Link>
                <Link href="/dashboard/events" className="text-foreground hover:text-primary text-sm font-semibold transition-colors">Events</Link>
                <Link href="/dashboard/products" className="text-foreground hover:text-primary text-sm font-semibold transition-colors">Products</Link>
                <Link href="/dashboard/orders" className="text-foreground hover:text-primary text-sm font-semibold transition-colors">Orders</Link>
              </nav>
            </div>
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
              <Button variant="outline" size="sm" className="font-bold">Settings</Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-black font-bold">Logout</Button>
            </div>
          </div>
        </div>
      </header>

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
          <Button className="mt-4 sm:mt-0 bg-primary hover:bg-primary/90 text-black font-bold">
            Create Event
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <Card key={idx} className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {stat.value}
                </p>
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
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {order.customer}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.product}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-primary font-semibold">
                      ₪{order.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === 'paid' ? 'default' :
                          order.status === 'shipped' ? 'secondary' :
                          'outline'
                        }
                        className={
                          order.status === 'paid' ? 'bg-green-600' :
                          order.status === 'shipped' ? 'bg-blue-600' :
                          ''
                        }
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Upcoming Events */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                Upcoming Events
              </h2>
              <Button variant="outline" size="sm" className="font-bold">
                View All
              </Button>
            </div>

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
                  <Button
                    size="sm"
                    variant={event.status === 'live' ? 'default' : 'outline'}
                    className={event.status === 'live' ? 'bg-red-600 hover:bg-red-700 text-white font-bold' : 'font-bold'}
                  >
                    {event.status === 'live' ? 'Join' : 'Manage'}
                  </Button>
                </div>
              ))}
            </div>
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
            <Button variant="outline" className="h-24 flex-col gap-2 font-bold">
              <span className="text-3xl">📅</span>
              <span>Schedule Event</span>
            </Button>
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
