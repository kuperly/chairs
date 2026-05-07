'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, ArrowLeft, Package, User, MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/lib/auth/context';
import { formatPrice, formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  customer: {
    id: string;
    fullName: string;
    email: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    priceAtPurchase: number;
    productName: string;
    productImageUrl: string;
    product: {
      name: string;
      imageUrls: string[];
    };
  }>;
  shippingAddress: any;
  stripePaymentIntentId: string | null;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  paid: 'bg-blue-500',
  processing: 'bg-purple-500',
  shipped: 'bg-green-500',
  delivered: 'bg-emerald-500',
  cancelled: 'bg-red-500',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending Payment',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchOrder();
      }
    }
  }, [user, authLoading, params.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }
      const data = await response.json();
      setOrder(data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order');
      router.push('/dashboard/orders');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return;

    try {
      const response = await fetch(`/api/orders/${params.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      toast.success(`Order status updated to ${statusLabels[newStatus]}`);
      fetchOrder();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-2xl font-bold mb-4">Order not found</h2>
            <Button onClick={() => router.push('/dashboard/orders')}>
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push('/dashboard/orders')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Button>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
          <p className="text-muted-foreground mt-1">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <Select value={order.status} onValueChange={updateOrderStatus}>
          <SelectTrigger className="w-[180px]">
            <Badge className={statusColors[order.status]}>
              {statusLabels[order.status]}
            </Badge>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-3 rounded-lg border">
                  <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={
                        item.productImageUrl ||
                        item.product?.imageUrls[0] ||
                        '/placeholder.png'
                      }
                      alt={item.productName || item.product?.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {item.productName || item.product?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Price: {formatPrice(item.priceAtPurchase)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatPrice(item.priceAtPurchase * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{order.customer.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {order.customer.email}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => router.push(`/dashboard/users/${order.customer.id}`)}
              >
                View Customer Profile
              </Button>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.shippingAddress ? (
                <div className="text-sm space-y-1">
                  <p>{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  <div className="pt-2 border-t mt-2">
                    <p className="text-muted-foreground">
                      {order.shippingAddress.email}
                    </p>
                    <p className="text-muted-foreground">
                      {order.shippingAddress.phone}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No shipping address provided
                </p>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={statusColors[order.status]}>
                    {statusLabels[order.status]}
                  </Badge>
                </div>
                {order.stripePaymentIntentId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment ID:</span>
                    <span className="font-mono text-xs">
                      {order.stripePaymentIntentId.substring(0, 20)}...
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-semibold">
                  <span>Total Paid:</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
