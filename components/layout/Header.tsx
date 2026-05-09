'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/lib/auth/context';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useCart } from '@/lib/cart/context';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { Menu, X, User, LogOut, LayoutDashboard, ShoppingBag, ShoppingCart } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export function Header() {
  const { isAuthenticated, signOut, loading: authLoading } = useAuth();
  const { user, hasPermission, loading: userLoading } = useCurrentUser();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const loading = authLoading || userLoading;

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setShowUserMenu(false);
    setMobileMenuOpen(false);
    await signOut();
    router.push('/');
  };

  // Determine what navigation to show based on permissions
  const canCreateProducts = hasPermission(PERMISSIONS.PRODUCT_CREATE);
  const canCreateOrders = hasPermission(PERMISSIONS.ORDER_CREATE);
  const canViewUsers = hasPermission(PERMISSIONS.USER_READ);

  // Navigation types:
  // - Customer: Can create orders (shop, cart)
  // - Manufacturer/Admin: Can create products (dashboard only)
  const isBackofficeUser = canCreateProducts || canViewUsers;
  const isCustomerUser = canCreateOrders && !isBackofficeUser;

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={isBackofficeUser ? '/dashboard' : '/'} className="flex-shrink-0">
            <div className="h-10 sm:h-12 w-auto relative" style={{ width: '150px' }}>
              <Image
                src="/logo.png"
                alt="LiveChairs Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {!isAuthenticated ? (
              // Guest Navigation
              <>
                <Link href="/" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                  HOME
                </Link>
                <Link href="/shop" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                  SHOP
                </Link>
              </>
            ) : isBackofficeUser ? (
              // Backoffice Navigation (Manufacturer/Admin)
              <>
                <Link href="/dashboard" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                  DASHBOARD
                </Link>
                <Link href="/dashboard/events" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                  EVENTS
                </Link>
                <Link href="/dashboard/products" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                  PRODUCTS
                </Link>
                <Link href="/dashboard/orders" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                  ORDERS
                </Link>
                {canViewUsers && (
                  <Link href="/dashboard/users" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                    USERS
                  </Link>
                )}
              </>
            ) : (
              // Customer Navigation
              <>
                <Link href="/" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                  HOME
                </Link>
                <Link href="/shop" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                  SHOP
                </Link>
              </>
            )}
          </nav>

          {/* Right Side - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />

            {loading ? (
              <div className="w-20 h-9 bg-muted animate-pulse rounded" />
            ) : isAuthenticated ? (
              <>
                {/* Cart - Only for customers */}
                {isCustomerUser && (
                  <Link href="/checkout">
                    <Button variant="outline" size="sm" className="gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Cart ({itemCount})
                    </Button>
                  </Link>
                )}

                {/* User Menu */}
                <div className="relative user-menu-container">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">{user?.fullName || user?.email?.split('@')[0]}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-md shadow-lg py-1">
                      {isCustomerUser && (
                        <>
                          <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-muted transition-colors">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              My Profile
                            </div>
                          </Link>
                          <Link href="/profile/orders" className="block px-4 py-2 text-sm hover:bg-muted transition-colors">
                            <div className="flex items-center gap-2">
                              <ShoppingBag className="w-4 h-4" />
                              My Orders
                            </div>
                          </Link>
                        </>
                      )}
                      {isBackofficeUser && (
                        <Link href="/dashboard" className="block px-4 py-2 text-sm hover:bg-muted transition-colors">
                          <div className="flex items-center gap-2">
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                          </div>
                        </Link>
                      )}
                      <div className="border-t border-border my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors text-red-600 dark:text-red-400"
                      >
                        <div className="flex items-center gap-2">
                          <LogOut className="w-4 h-4" />
                          Logout
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                    REGISTER
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-muted rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pt-4 pb-3 border-t border-border mt-3">
            <nav className="flex flex-col gap-2">
              {!isAuthenticated ? (
                // Guest Mobile Nav
                <>
                  <Link href="/" className="px-3 py-2 text-sm font-semibold rounded-md hover:bg-muted transition-colors">
                    HOME
                  </Link>
                  <Link href="/shop" className="px-3 py-2 text-sm font-semibold rounded-md hover:bg-muted transition-colors">
                    SHOP
                  </Link>
                </>
              ) : isBackofficeUser ? (
                // Backoffice Mobile Nav
                <>
                  <Link href="/dashboard" className="px-3 py-2 text-sm font-semibold rounded-md hover:bg-muted transition-colors">
                    DASHBOARD
                  </Link>
                  <Link href="/dashboard/events" className="px-3 py-2 text-sm font-semibold rounded-md hover:bg-muted transition-colors">
                    EVENTS
                  </Link>
                  <Link href="/dashboard/products" className="px-3 py-2 text-sm font-semibold rounded-md hover:bg-muted transition-colors">
                    PRODUCTS
                  </Link>
                  <Link href="/dashboard/orders" className="px-3 py-2 text-sm font-semibold rounded-md hover:bg-muted transition-colors">
                    ORDERS
                  </Link>
                  {canViewUsers && (
                    <Link href="/dashboard/users" className="px-3 py-2 text-sm font-semibold rounded-md hover:bg-muted transition-colors">
                      USERS
                    </Link>
                  )}
                </>
              ) : (
                // Customer Mobile Nav
                <>
                  <Link href="/" className="px-3 py-2 text-sm font-semibold rounded-md hover:bg-muted transition-colors">
                    HOME
                  </Link>
                  <Link href="/shop" className="px-3 py-2 text-sm font-semibold rounded-md hover:bg-muted transition-colors">
                    SHOP
                  </Link>
                  <Link href="/checkout" className="px-3 py-2 text-sm font-semibold rounded-md hover:bg-muted transition-colors flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    CART ({itemCount})
                  </Link>
                </>
              )}

              <div className="border-t border-border my-2" />

              {loading ? (
                <div className="px-3 py-2">
                  <div className="w-full h-9 bg-muted animate-pulse rounded" />
                </div>
              ) : isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    {user?.email}
                  </div>
                  {isCustomerUser && (
                    <>
                      <Link href="/profile" className="px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors flex items-center gap-2">
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      <Link href="/profile/orders" className="px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        My Orders
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-red-600 dark:text-red-400 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold mt-2">
                      REGISTER
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
