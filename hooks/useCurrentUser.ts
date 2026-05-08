'use client';

import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api/client';

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  roleId: string;
  isActive: boolean;
  roles: {
    id: string;
    name: string;
    description: string;
  };
  manufacturers?: {
    id: string;
    companyName: string;
    logoUrl: string | null;
    description: string | null;
    isApproved: boolean;
    isHidden: boolean;
  };
  permissions: string[];
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await usersApi.me();
        setUser(response.data);
      } catch (err) {
        // User not authenticated or error fetching
        setError(err instanceof Error ? err : new Error('Failed to fetch user'));
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(p => hasPermission(p));
  };

  return {
    user,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin: user?.roles?.name === 'admin',
    isManufacturer: user?.roles?.name === 'manufacturer',
    isCustomer: user?.roles?.name === 'customer',
  };
}
