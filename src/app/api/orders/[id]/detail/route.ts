import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const { getPrisma } = await import('@/lib/db');
    const orderId = parseInt(params.id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const prisma = getPrisma();

    // Fetch order with logos and details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        details: {
          select: {
            fieldName: true,
            fieldValue: true,
          },
        },
        logoVariants: {
          orderBy: { variantNum: 'asc' },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only allow customers to see orders that are approved or beyond
    if (!['approved', 'ready_for_review', 'completed', 'archived'].includes(order.status)) {
      return NextResponse.json(
        { error: 'Order not ready for logo selection' },
        { status: 403 }
      );
    }

    // Transform details into an object
    const details: Record<string, any> = {};
    order.details.forEach((detail) => {
      details[detail.fieldName] = detail.fieldValue;
    });

    return NextResponse.json({
      id: order.id,
      tier: order.tier,
      status: order.status,
      customerEmail: order.customerEmail,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      data: details,
      logos: order.logoVariants,
    });
  } catch (error) {
    console.error('Error fetching order detail:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};
