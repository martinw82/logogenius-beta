import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export const GET = async (
  request: NextRequest,
  { params }: { params: { token: string } }
) => {
  try {
    const { getPrisma } = await import('@/lib/db');
    const { verifyTokenHash } = await import('@/lib/services/token-service');

    const token = params.token;

    if (!token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const prisma = getPrisma();

    // Find the order by token (need to check all tokens)
    // For now, we'll search through all orders with dashboard tokens
    // In production, store tokens in database
    // This is a simplified approach - ideally use DashboardToken table

    // For MVP, we'll match token to order via a simple lookup
    // In real implementation, verify token hash against stored hash

    // Find order with this token (assuming token stored in OrderDetail)
    const detail = await prisma.orderDetail.findFirst({
      where: {
        fieldName: 'dashboard_token',
        fieldValue: token,
      },
      include: {
        order: {
          include: {
            details: true,
            logoVariants: true,
          },
        },
      },
    });

    if (!detail || !detail.order) {
      return NextResponse.json({ error: 'Token not found or expired' }, { status: 404 });
    }

    const order = detail.order;

    // Check if token is still valid (created within last year)
    const createdAtDetail = order.details.find((d) => d.fieldName === 'created_at');
    if (createdAtDetail) {
      const createdAt = new Date(createdAtDetail.fieldValue);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      if (createdAt < oneYearAgo) {
        return NextResponse.json({ error: 'Token has expired' }, { status: 401 });
      }
    }

    // Only show completed orders on customer dashboard
    if (order.status !== 'completed') {
      return NextResponse.json(
        {
          error: 'Order not yet completed. Please check back later.',
        },
        { status: 403 }
      );
    }

    // Transform details into object
    const orderData: Record<string, any> = {
      id: order.id,
      tier: order.tier,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    order.details.forEach((detail) => {
      if (!detail.fieldName.startsWith('dashboard_')) {
        orderData[detail.fieldName] = detail.fieldValue;
      }
    });

    // Find selected logo
    const selectedLogo = order.logoVariants.find((logo) => logo.selected);
    if (selectedLogo) {
      orderData.selectedLogoUrl = selectedLogo.svgData;
    }

    // Include all logos for gallery
    orderData.logos = order.logoVariants.map((logo) => ({
      url: logo.svgData,
      variantNum: logo.variantNum,
    }));

    return NextResponse.json(orderData);
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json(
      {
        error: 'Failed to load dashboard',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};
