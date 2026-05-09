import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/live',
    '/shop',
    '/login',
    '/register',
    '/api',
  ];

  // Customer-only routes (require order.create permission)
  const customerOnlyRoutes = [
    '/checkout',
    '/profile',
  ];

  // Manufacturer/Admin-only routes (require product.create permission)
  const manufacturerOnlyRoutes = [
    '/dashboard',
  ];

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => {
    if (route === '/') return pathname === '/';
    if (route === '/api') return pathname.startsWith('/api');
    return pathname.startsWith(route);
  });

  // Check if it's a customer-only route
  const isCustomerRoute = customerOnlyRoutes.some(route => pathname.startsWith(route));

  // Check if it's a manufacturer-only route
  const isManufacturerRoute = manufacturerOnlyRoutes.some(route => pathname.startsWith(route));

  // Allow public routes without authentication check
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For protected routes, check authentication
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase environment variables not configured');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session and trying to access protected route, redirect to login
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For customer-only routes, check if user has order.create permission
  if (isCustomerRoute) {
    // Get user's permissions from database
    const { data: userData } = await supabase
      .from('users')
      .select(`
        id,
        roles!inner (
          role_permissions (
            permissions (
              name
            )
          )
        )
      `)
      .eq('id', session.user.id)
      .single();

    const roleData = userData?.roles as any;
    const permissions = roleData?.role_permissions?.map(
      (rp: any) => rp.permissions.name
    ) || [];

    const canCreateOrders = permissions.includes('order.create');

    // If user doesn't have permission to create orders, redirect to dashboard
    if (!canCreateOrders) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // For manufacturer-only routes, check if user has product.create permission
  if (isManufacturerRoute) {
    // Get user's permissions from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        roles!inner (
          role_permissions (
            permissions (
              name
            )
          )
        )
      `)
      .eq('id', session.user.id)
      .single();

    console.log('[Middleware] Dashboard access check:', {
      userId: session.user.id,
      userEmail: session.user.email,
      userData: userData,
      userError: userError,
      hasUserData: !!userData,
    });

    const roleData = userData?.roles as any;
    console.log('[Middleware] Role data:', roleData);

    const permissions = roleData?.role_permissions?.map(
      (rp: any) => rp.permissions.name
    ) || [];

    const canCreateProducts = permissions.includes('product.create');

    console.log('[Middleware] Permissions check:', { permissions, canCreateProducts });

    // If user doesn't have permission to create products, redirect to home
    if (!canCreateProducts) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // If authenticated and trying to access login/register, redirect appropriately
  if (session && (pathname === '/login' || pathname === '/register')) {
    // Get user's permissions to decide where to redirect
    const { data: userData } = await supabase
      .from('users')
      .select(`
        id,
        roles!inner (
          role_permissions (
            permissions (
              name
            )
          )
        )
      `)
      .eq('id', session.user.id)
      .single();

    const roleData = userData?.roles as any;
    const permissions = roleData?.role_permissions?.map(
      (rp: any) => rp.permissions.name
    ) || [];

    const canCreateProducts = permissions.includes('product.create');

    // Redirect manufacturers/admins to dashboard, customers to home
    if (canCreateProducts) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
