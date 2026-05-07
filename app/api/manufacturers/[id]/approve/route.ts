import { NextRequest } from 'next/server';
import { withErrorHandling, successResponse, errorResponse } from '@/lib/utils/api-wrapper';
import { requireSession } from '@/lib/auth/session';
import { requirePermission } from '@/lib/permissions/check';
import { PERMISSIONS } from '@/lib/permissions/definitions';
import { approveManufacturerSchema } from '@/lib/validation/manufacturer';
import { supabase } from '@/lib/auth/supabase';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * POST /api/manufacturers/[id]/approve
 * Approve or reject a manufacturer
 * Requires: manufacturer.approve permission (admin only)
 */
export const dynamic = 'force-dynamic';

export const POST = withErrorHandling(async (req: NextRequest, { params }: RouteParams) => {
  const { id } = params;
  const session = await requireSession();

  // Check permission
  await requirePermission(session.user.id, PERMISSIONS.MANUFACTURER_APPROVE);

  // Get existing manufacturer
  const { data: existingManufacturer, error: fetchError } = await supabase
    .from('manufacturers')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !existingManufacturer) {
    return errorResponse('Manufacturer not found', 404, 'MANUFACTURER_NOT_FOUND');
  }

  // Parse and validate approval data
  const body = await req.json();
  const validatedData = approveManufacturerSchema.parse(body);

  // Update manufacturer approval status
  const { data: manufacturer, error } = await supabase
    .from('manufacturers')
    .update({
      isApproved: validatedData.isApproved,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', id)
    .select(
      `
      *,
      users!manufacturerId(id, email, fullName)
    `
    )
    .single();

  if (error) {
    throw new Error(`Failed to update manufacturer approval: ${error.message}`);
  }

  // TODO: Send email notification to manufacturer owner
  // If approved: Welcome email with next steps
  // If rejected: Rejection email with notes/reasons

  const message = validatedData.isApproved
    ? 'Manufacturer approved successfully'
    : 'Manufacturer approval revoked';

  return successResponse(manufacturer, message);
});
