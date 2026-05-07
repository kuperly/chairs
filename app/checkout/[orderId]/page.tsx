'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils/format';
import { toast } from 'sonner';

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  items: Array<{
    id: string;
    quantity: number;
    priceAtPurchase: number;
    product: {
      name: string;
      imageUrls: string[];
    };
  }>;
  shippingAddress: any;
}

export default function PaymentPage({
  params,
}: {
  params: { orderId: string };
}) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [params.orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.orderId}`);
      if (!response.ok) {
        throw new Error('Order not found');
      }
      const data = await response.json();
      setOrder(data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order');
      router.push('/shop');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Create Stripe payment intent
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: params.orderId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // For POC, simulate payment success
      // In production, use Stripe Elements here
      if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
        // Mock payment flow
        setTimeout(async () => {
          // Update order status to paid
          await fetch(`/api/orders/${params.orderId}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: 'paid',
            }),
          });

          toast.success('Payment successful!');
          router.push(`/checkout/success?orderId=${params.orderId}`);
        }, 2000);
      } else {
        // Real Stripe integration would go here
        // For now, redirect to mock payment page
        router.push(`/checkout/mock-payment?orderId=${params.orderId}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
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
            <Button onClick={() => router.push('/shop')}>
              Back to Shop
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Complete Payment</h1>

      {/* Order Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order #{order.orderNumber}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.quantity} × {item.product.name}
                </span>
                <span>{formatPrice(item.priceAtPurchase * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-1">
            <p>{order.shippingAddress?.fullName}</p>
            <p>{order.shippingAddress?.address}</p>
            <p>
              {order.shippingAddress?.city},{' '}
              {order.shippingAddress?.postalCode}
            </p>
            <p>{order.shippingAddress?.country}</p>
            <p className="pt-2">{order.shippingAddress?.email}</p>
            <p>{order.shippingAddress?.phone}</p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Section */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-5 w-5" />
              <span className="font-medium">Credit Card</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {process.env.NEXT_PUBLIC_USE_MOCKS === 'true'
                ? 'Mock payment mode - Payment will be simulated'
                : 'Secure payment powered by Stripe'}
            </p>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Pay {formatPrice(order.totalAmount)}
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Your payment information is secure and encrypted
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
