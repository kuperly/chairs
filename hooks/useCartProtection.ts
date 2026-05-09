'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { toast } from 'sonner';

export function useCartProtection() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { hasPermission } = useCurrentUser();

  const canAddToCart = isAuthenticated && hasPermission(PERMISSIONS.ORDER_CREATE);

  const requireLogin = (action: 'cart' | 'checkout' = 'cart') => {
    if (!isAuthenticated) {
      const redirectPath = action === 'cart' ? pathname : '/checkout';
      router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
      return false;
    }

    if (!hasPermission(PERMISSIONS.ORDER_CREATE)) {
      // User is logged in but doesn't have permission to order (e.g., manufacturer)
      toast.error('Only customers can add items to cart');
      return false;
    }

    return true;
  };

  const handleAddToCart = (callback?: () => void) => {
    if (requireLogin('cart')) {
      callback?.();
    }
  };

  const handleCheckout = (callback?: () => void) => {
    if (requireLogin('checkout')) {
      callback?.();
    }
  };

  return {
    canAddToCart,
    requireLogin,
    handleAddToCart,
    handleCheckout,
    isAuthenticated,
  };
}
