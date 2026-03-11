import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export const PATCH = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const { getPrisma } = await import('@/lib/db');
    const { selectedLogoVariant } = await request.json();
    const orderId = parseInt(params.id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    if (!selectedLogoVariant || typeof selectedLogoVariant !== 'number') {
      return NextResponse.json(
        { error: 'Invalid logo variant selection' },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    // Verify order exists and is in correct status
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!['approved', 'ready_for_review'].includes(order.status)) {
      return NextResponse.json(
        { error: 'Order not in correct status for logo selection' },
        { status: 400 }
      );
    }

    // Mark the selected logo variant
    await prisma.logoVariant.updateMany({
      where: { orderId },
      data: { selected: false },
    });

    await prisma.logoVariant.updateMany({
      where: {
        orderId,
        variantNum: selectedLogoVariant,
      },
      data: { selected: true },
    });

    // Update order status to "generating_assets"
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'generating_assets',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      order: updated,
      message: 'Logo selected. Generating assets...',
    });
  } catch (error) {
    console.error('Error selecting logo:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};
