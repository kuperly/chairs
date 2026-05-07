import { useState, useEffect } from 'react';
import { ordersApi } from '@/lib/api/client';

export interface Order {
  id: string;
  customerId: string;
  eventId: string | null;
  totalAmount: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentIntentId: string | null;
  createdAt: string;
  updatedAt: string;
  customers?: {
    id: string;
    fullName: string;
    email: string;
  };
  events?: {
    id: string;
    title: string;
  } | null;
  order_items?: Array<{
    id: string;
    productId: string;
    quantity: number;
    priceAtPurchase: number;
    productSnapshot: any;
  }>;
}

export interface UseOrdersOptions {
  status?: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  customerId?: string;
  eventId?: string;
  limit?: number;
  offset?: number;
}

export interface UseOrdersResult {
  orders: Order[];
  loading: boolean;
  error: Error | null;
  total: number;
  refetch: () => void;
}

/**
 * Hook to fetch orders list
 */
export function useOrders(options: UseOrdersOptions = {}): UseOrdersResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [total, setTotal] = useState(0);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ordersApi.list(options);

      setOrders(response.data.orders || []);
      setTotal(response.data.pagination?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch orders'));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [
    options.status,
    options.customerId,
    options.eventId,
    options.limit,
    options.offset,
  ]);

  return {
    orders,
    loading,
    error,
    total,
    refetch: fetchOrders,
  };
}

/**
 * Hook to fetch single order
 */
export function useOrder(id: string | null) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrder = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await ordersApi.get(id);
      setOrder(response.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch order'));
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  return {
    order,
    loading,
    error,
    refetch: fetchOrder,
  };
}

/**
 * Hook to fetch recent orders
 */
export function useRecentOrders(limit: number = 5) {
  return useOrders({ limit });
}
