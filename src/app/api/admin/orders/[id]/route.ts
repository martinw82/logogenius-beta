import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder, prisma } from '@/lib/database';
import { verifyAdminToken, getTokenFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Helper to verify auth
async function verifyAuth(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return { error: 'Unauthorized - No token provided', status: 401 };
  }

  const admin = await verifyAdminToken(token);
  if (!admin) {
    return { error: 'Unauthorized - Invalid token', status: 401 };
  }

  return { admin };
}

// GET /api/admin/orders/[id] - Get order details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth(request);
    if ('error' in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    // Fetch order from database
    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Transform details into an object
    const details: Record<string, any> = {};
    order.details.forEach((detail: any) => {
      details[detail.fieldName] = detail.fieldValue;
    });

    // Debug: Log what mockup data we have
    console.log('[Admin Order] Mockup data from OrderDetail:', {
      mockup_letterhead: details.mockup_letterhead ? 'present' : 'missing',
      mockup_tshirt: details.mockup_tshirt ? 'present' : 'missing',
      mockup_businesscard: details.mockup_businesscard ? 'present' : 'missing',
    });

    // Merge logo data: use logoVariants for structure, but get full data from OrderDetail
    const logos = order.logoVariants.map((variant: any) => {
      const logoUrlKey = `logoUrl_${variant.variantNum - 1}`;
      const fullImageData = details[logoUrlKey];
      
      // Use the variant's stored mockupPaths (each variant now has its own mockups)
      const mergedMockupPaths = variant.mockupPaths;
      
      console.log(`[Admin Order] Variant ${variant.variantNum}: mockupPaths =`, mergedMockupPaths ? 'present' : 'missing');
      
      return {
        ...variant,
        // Use full image from OrderDetail if available, otherwise fall back to svgData
        svgData: fullImageData || variant.svgData,
        // Use the variant's stored mockupPaths
        mockupPaths: mergedMockupPaths,
      };
    });

    return NextResponse.json({
      id: order.id,
      tier: order.tier,
      status: order.status,
      customerEmail: order.customerEmail,
      selectedLogoId: order.selectedLogoId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      data: details,
      logos: logos,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/orders/[id] - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await verifyAuth(request);
    if ('error' in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status, notes } = body;

    if (!status || !['approved', 'rejected', 'pending', 'completed', 'archived'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Verify order exists
    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order status
    const updated = await updateOrder(orderId, { status });

    // Save notes if provided
    if (notes) {
      await prisma.orderDetail.upsert({
        where: {
          orderId_fieldName: {
            orderId: orderId,
            fieldName: 'admin_notes',
          },
        },
        update: { fieldValue: notes },
        create: {
          orderId: orderId,
          fieldName: 'admin_notes',
          fieldValue: notes,
        },
      });
    }

    return NextResponse.json({
      success: true,
      order: updated,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
