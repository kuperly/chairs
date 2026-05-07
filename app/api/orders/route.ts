import { NextRequest } from 'next/server';
import { withErrorHandling, successResponse, errorResponse } from '@/lib/utils/api-wrapper';
import { requireSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/permissions/check';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { createOrderSchema, listOrdersQuerySchema } from '@/lib/validation/order';
import { supabase } from '@/lib/auth/supabase';

/**
 * GET /api/orders
 * List orders
 * Customers see only their orders, admins see all
 */
export const GET = withErrorHandling(async (req: NextRequest) => {
  const session = await requireSession();

  // Parse query parameters
  const searchParams = Object.fromEntries(req.nextUrl.searchParams);
  const query = listOrdersQuerySchema.parse(searchParams);

  // Check if user can view all orders
  const canViewAll = await hasPermission(session.user.id, PERMISSIONS.ORDER_READ_ALL);

  // Build Supabase query
  let supabaseQuery = supabase
    .from('orders')
    .select(
      `
      *,
      users!customerId(id, email, fullName),
      live_events!purchasedDuringEventId(id, title),
      order_items(
        id,
        quantity,
        priceAtPurchase,
        productName,
        productImageUrl,
        products(id, name, category)
      )
    `,
      { count: 'exact' }
    );

  // If user cannot view all, restrict to their own orders
  if (!canViewAll) {
    supabaseQuery = supabaseQuery.eq('customerId', session.user.id);
  } else {
    // Admin can filter by customer if specified
    if (query.customerId) {
      supabaseQuery = supabaseQuery.eq('customerId', query.customerId);
    }
  }

  // Apply filters
  if (query.status) {
    supabaseQuery = supabaseQuery.eq('status', query.status);
  }

  if (query.eventId) {
    supabaseQuery = supabaseQuery.eq('purchasedDuringEventId', query.eventId);
  }

  // Apply pagination
  const limit = query.limit ? parseInt(query.limit) : 20;
  const offset = query.offset ? parseInt(query.offset) : 0;
  supabaseQuery = supabaseQuery.range(offset, offset + limit - 1);

  // Order by created date (newest first)
  supabaseQuery = supabaseQuery.order('createdAt', { ascending: false });

  const { data: orders, error, count } = await supabaseQuery;

  if (error) {
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }

  return successResponse({
    orders,
    pagination: {
      total: count || 0,
      limit,
      offset,
    },
  });
});

/**
 * POST /api/orders
 * Create a new order (checkout)
 * Requires: order.create permission (authenticated customer)
 */
export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requireSession();

  // Check permission
  const canCreateOrder = await hasPermission(session.user.id, PERMISSIONS.ORDER_CREATE);
  if (!canCreateOrder) {
    return errorResponse('Permission denied', 403, 'PERMISSION_DENIED');
  }

  // Parse and validate request body
  const body = await req.json();
  const validatedData = createOrderSchema.parse(body);

  // Fetch all products to validate availability and get prices
  const productIds = validatedData.items.map((item) => item.productId);
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .in('id', productIds)
    .eq('isActive', true);

  if (productsError) {
    throw new Error(`Failed to fetch products: ${productsError.message}`);
  }

  // Validate all products exist and are available
  if (products.length !== productIds.length) {
    return errorResponse(
      'Some products are not available',
      400,
      'PRODUCTS_NOT_AVAILABLE'
    );
  }

  // Create a map of products for easy lookup
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Check stock availability
  for (const item of validatedData.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return errorResponse(`Product ${item.productId} not found`, 404, 'PRODUCT_NOT_FOUND');
    }

    if (product.stockQuantity < item.quantity) {
      return errorResponse(
        `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`,
        400,
        'INSUFFICIENT_STOCK'
      );
    }
  }

  // If ordered during/after an event, validate purchase window
  if (validatedData.eventId) {
    const { data: event, error: eventError } = await supabase
      .from('live_events')
      .select('status, purchaseWindowEndTime')
      .eq('id', validatedData.eventId)
      .single();

    if (eventError || !event) {
      return errorResponse('Event not found', 404, 'EVENT_NOT_FOUND');
    }

    // Check if event is live or in purchase window
    if (!['live', 'purchase_window'].includes(event.status)) {
      return errorResponse(
        'Products can only be purchased during live events or within 7 days after',
        400,
        'PURCHASE_WINDOW_CLOSED'
      );
    }

    // Check if purchase window has expired
    if (event.purchaseWindowEndTime && new Date(event.purchaseWindowEndTime) < new Date()) {
      return errorResponse(
        'Purchase window has expired',
        400,
        'PURCHASE_WINDOW_EXPIRED'
      );
    }
  }

  // Calculate total amount
  let totalAmount = 0;
  for (const item of validatedData.items) {
    const product = productMap.get(item.productId)!;
    totalAmount += product.price * item.quantity;
  }

  // Generate unique order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      orderNumber,
      customerId: session.user.id,
      totalAmount,
      status: 'pending',
      shippingAddress: validatedData.shippingAddress,
      purchasedDuringEventId: validatedData.eventId || null,
    })
    .select('*')
    .single();

  if (orderError) {
    throw new Error(`Failed to create order: ${orderError.message}`);
  }

  // Create order items (snapshot product details)
  const orderItemsData = validatedData.items.map((item) => {
    const product = productMap.get(item.productId)!;
    return {
      orderId: order.id,
      productId: product.id,
      quantity: item.quantity,
      priceAtPurchase: product.price,
      productName: product.name,
      productImageUrl: product.imageUrls[0] || null,
    };
  });

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsData);

  if (itemsError) {
    // Rollback order creation if items fail
    await supabase.from('orders').delete().eq('id', order.id);
    throw new Error(`Failed to create order items: ${itemsError.message}`);
  }

  // Update product stock quantities
  for (const item of validatedData.items) {
    const product = productMap.get(item.productId)!;
    const newStock = product.stockQuantity - item.quantity;

    await supabase
      .from('products')
      .update({ stockQuantity: newStock })
      .eq('id', product.id);
  }

  // Fetch complete order with items
  const { data: completeOrder } = await supabase
    .from('orders')
    .select(
      `
      *,
      order_items(
        id,
        quantity,
        priceAtPurchase,
        productName,
        productImageUrl,
        products(id, name, category)
      )
    `
    )
    .eq('id', order.id)
    .single();

  // TODO: Initiate Stripe payment here
  // For POC, we'll use mock payments

  return successResponse(
    {
      order: completeOrder,
      // TODO: Return Stripe payment intent or mock payment URL
      paymentUrl: `/checkout/${order.id}`,
    },
    'Order created successfully'
  );
});
