import { NextRequest } from 'next/server';
import { withErrorHandling, successResponse, errorResponse } from '@/lib/utils/api-wrapper';
import { requireSession } from '@/lib/auth/session';
import { requirePermission } from '@/lib/permissions/check';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { createUserSchema, listUsersQuerySchema } from '@/lib/validation/user';
import { supabase } from '@/lib/auth/supabase';

/**
 * GET /api/users
 * List users
 * Requires: user.read permission (admin only)
 */
export const GET = withErrorHandling(async (req: NextRequest) => {
  const session = await requireSession();

  // Check permission
  await requirePermission(session.user.id, PERMISSIONS.USER_READ);

  // Parse query parameters
  const searchParams = Object.fromEntries(req.nextUrl.searchParams);
  const query = listUsersQuerySchema.parse(searchParams);

  // Build Supabase query
  let supabaseQuery = supabase
    .from('users')
    .select(
      `
      *,
      roles(id, name, description),
      manufacturers(id, companyName, logoUrl)
    `,
      { count: 'exact' }
    );

  // Apply filters
  if (query.roleId) {
    supabaseQuery = supabaseQuery.eq('roleId', query.roleId);
  }

  if (query.manufacturerId) {
    supabaseQuery = supabaseQuery.eq('manufacturerId', query.manufacturerId);
  }

  if (query.isActive) {
    supabaseQuery = supabaseQuery.eq('isActive', query.isActive === 'true');
  }

  if (query.search) {
    supabaseQuery = supabaseQuery.or(
      `fullName.ilike.%${query.search}%,email.ilike.%${query.search}%`
    );
  }

  // Apply pagination
  const limit = query.limit ? parseInt(query.limit) : 20;
  const offset = query.offset ? parseInt(query.offset) : 0;
  supabaseQuery = supabaseQuery.range(offset, offset + limit - 1);

  // Order by created date
  supabaseQuery = supabaseQuery.order('createdAt', { ascending: false });

  const { data: users, error, count } = await supabaseQuery;

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  return successResponse({
    users,
    pagination: {
      total: count || 0,
      limit,
      offset,
    },
  });
});

/**
 * POST /api/users
 * Create a new user (admin only)
 * Requires: user.update permission
 */
export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requireSession();

  // Check permission (using user.update since we don't have user.create)
  await requirePermission(session.user.id, PERMISSIONS.USER_UPDATE);

  // Parse and validate request body
  const body = await req.json();
  const validatedData = createUserSchema.parse(body);

  // Verify role exists
  const { data: role, error: roleError } = await supabase
    .from('roles')
    .select('id')
    .eq('id', validatedData.roleId)
    .single();

  if (roleError || !role) {
    return errorResponse('Role not found', 404, 'ROLE_NOT_FOUND');
  }

  // If manufacturer is specified, verify it exists
  if (validatedData.manufacturerId) {
    const { data: manufacturer, error: mfgError } = await supabase
      .from('manufacturers')
      .select('id')
      .eq('id', validatedData.manufacturerId)
      .single();

    if (mfgError || !manufacturer) {
      return errorResponse('Manufacturer not found', 404, 'MANUFACTURER_NOT_FOUND');
    }
  }

  // Check if email already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', validatedData.email)
    .single();

  if (existingUser) {
    return errorResponse('Email already exists', 400, 'EMAIL_EXISTS');
  }

  // Create user
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      email: validatedData.email,
      fullName: validatedData.fullName,
      roleId: validatedData.roleId,
      manufacturerId: validatedData.manufacturerId || null,
      supabaseAuthId: validatedData.supabaseAuthId || null,
      isActive: validatedData.isActive,
    })
    .select(
      `
      *,
      roles(id, name, description),
      manufacturers(id, companyName, logoUrl)
    `
    )
    .single();

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  // TODO: Send welcome email with instructions to set password

  return successResponse(user, 'User created successfully');
});
