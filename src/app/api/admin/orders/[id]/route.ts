import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const getHandler = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { verifyAdminMiddleware } = await import('@/lib/middleware/verify-admin');
  const { getPrisma } = await import('@/lib/db');

  try {
    // Verify admin session
    const session = await verifyAdminMiddleware(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const prisma = getPrisma();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        details: true,
        logoVariants: {
          orderBy: { variantNum: 'asc' },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
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
    console.error('Error fetching order:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};

const patchHandler = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { verifyAdminMiddleware } = await import('@/lib/middleware/verify-admin');
  const { getPrisma } = await import('@/lib/db');

  try {
    // Verify admin session
    const session = await verifyAdminMiddleware(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    const prisma = getPrisma();

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order status
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

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
};

export const GET = getHandler;
export const PATCH = patchHandler;
