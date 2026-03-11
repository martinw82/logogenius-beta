import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const handler = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { verifyAdminMiddleware } = await import('@/lib/middleware/verify-admin');
  const { processOrderAssets } = await import('@/lib/services/order-processor');
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

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get body for userApiKey
    const body = await request.json();
    const { userApiKey } = body;

    if (!userApiKey) {
      return NextResponse.json(
        { error: 'userApiKey is required' },
        { status: 400 }
      );
    }

    // Get business name from order details
    const businessNameDetail = await prisma.orderDetail.findFirst({
      where: {
        orderId: orderId,
        fieldName: 'businessName',
      },
    });

    const businessName = businessNameDetail?.fieldValue || `Order-${orderId}`;

    // Process the order (this will generate all assets)
    const result = await processOrderAssets({
      orderId,
      businessName,
      userApiKey,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Failed to process order',
          details: result.error,
        },
        { status: 500 }
      );
    }

    // Fetch updated order
    const updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { details: true },
    });

    return NextResponse.json({
      success: true,
      status: result.status,
      order: updatedOrder,
      assets: {
        pdf: result.pdfPath,
        zip: result.zipPath,
        readme: result.readmePath,
      },
    });
  } catch (error) {
    console.error('Error processing order:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};

export const POST = handler;
