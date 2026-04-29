import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ThemeToggle } from '@/components/theme-toggle';

export default function DashboardPage() {
  // Mock data
  const stats = [
    { label: 'Total Revenue', value: '$45,231.00', change: '+20.1% from last month' },
    { label: 'Active Events', value: '3', change: '2 live now' },
    { label: 'Total Orders', value: '124', change: '+12 this week' },
    { label: 'Products', value: '48', change: '8 low stock' }
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: 'John Doe', product: 'Executive Chair', amount: 299.99, status: 'paid' },
    { id: 'ORD-002', customer: 'Sarah Miller', product: 'Standing Desk', amount: 599.99, status: 'processing' },
    { id: 'ORD-003', customer: 'Mike Ross', product: 'Keyboard', amount: 89.99, status: 'paid' },
    { id: 'ORD-004', customer: 'Lisa Kim', product: 'Monitor Arm', amount: 149.99, status: 'shipped' }
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
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
              <nav className="hidden md:flex gap-6">
                <Link href="/dashboard" className="text-primary font-semibold">Dashboard</Link>
                <Link href="/dashboard/events" className="text-foreground hover:text-primary">Events</Link>
                <Link href="/dashboard/products" className="text-foreground hover:text-primary">Products</Link>
                <Link href="/dashboard/orders" className="text-foreground hover:text-primary">Orders</Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="outline" size="sm">Settings</Button>
              <Button size="sm">Logout</Button>
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
          <Button className="mt-4 sm:mt-0">
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
              <Button variant="outline" size="sm">
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
                      ${order.amount}
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
              <Button variant="outline" size="sm">
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
                    className={event.status === 'live' ? 'bg-red-600 hover:bg-red-700' : ''}
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
            <Button variant="outline" className="h-24 flex-col gap-2">
              <span className="text-3xl">📦</span>
              <span>Add Product</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2">
              <span className="text-3xl">📅</span>
              <span>Schedule Event</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2">
              <span className="text-3xl">📊</span>
              <span>View Analytics</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2">
              <span className="text-3xl">⚙️</span>
              <span>Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
