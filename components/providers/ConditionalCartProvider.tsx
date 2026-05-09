'use client';

import { ReactNode } from 'react';
import { CartProvider } from '@/lib/cart/context';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAuth } from '@/lib/auth/context';
import { PERMISSIONS } from '@/lib/permissions/definitions';

/**
 * Conditionally renders CartProvider only for users who can create orders
 * - Guest users: Yes (might become customers)
 * - Customers (order.create permission): Yes
 * - Manufacturers/Admins: No (they don't need cart)
 */
export function ConditionalCartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { hasPermission, loading: userLoading } = useCurrentUser();

  const loading = authLoading || userLoading;

  // While checking auth/permissions, don't render cart provider yet
  // to avoid loading cart data that might not be needed
  if (loading) {
    return <>{children}</>;
  }

  // For guests, load cart (they might become customers)
  if (!isAuthenticated) {
    return <CartProvider>{children}</CartProvider>;
  }

  // For authenticated users, only load cart if they can create orders
  const canCreateOrders = hasPermission(PERMISSIONS.ORDER_CREATE);

  if (canCreateOrders) {
    return <CartProvider>{children}</CartProvider>;
  }

  // For manufacturers/admins without order permission, skip cart entirely
  return <>{children}</>;
}
