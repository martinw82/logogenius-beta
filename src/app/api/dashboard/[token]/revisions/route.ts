import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export const POST = async (
  request: NextRequest,
  { params }: { params: { token: string } }
) => {
  try {
    const { getPrisma } = await import('@/lib/db');
    const { sections, notes } = await request.json();

    const token = params.token;

    if (!token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return NextResponse.json({ error: 'Please select at least one section' }, { status: 400 });
    }

    if (!notes || notes.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide detailed revision notes (minimum 10 characters)' },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    // Find order by token
    const detail = await prisma.orderDetail.findFirst({
      where: {
        fieldName: 'dashboard_token',
        fieldValue: token,
      },
      include: {
        order: true,
      },
    });

    if (!detail || !detail.order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = detail.order;

    // Check tier (only Pro and Premium allowed)
    if (order.tier !== 'pro' && order.tier !== 'premium') {
      return NextResponse.json(
        { error: 'Revisions are only available for Pro and Premium tiers' },
        { status: 403 }
      );
    }

    // Check revision count (max 2 revisions)
    const revisionCount = await prisma.orderDetail.count({
      where: {
        orderId: order.id,
        fieldName: 'revision_request_id',
      },
    });

    if (revisionCount >= 2) {
      return NextResponse.json(
        { error: 'You have reached your maximum number of revisions (2)' },
        { status: 429 }
      );
    }

    // Check if already requested (prevent duplicates)
    const existingRequest = await prisma.orderDetail.findFirst({
      where: {
        orderId: order.id,
        fieldName: 'latest_revision_status',
        fieldValue: 'pending',
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You have a pending revision request. Please wait for it to complete.' },
        { status: 409 }
      );
    }

    // Create revision request ID
    const revisionId = `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store revision request in OrderDetail
    await prisma.orderDetail.createMany({
      data: [
        {
          orderId: order.id,
          fieldName: 'revision_request_id',
          fieldValue: revisionId,
        },
        {
          orderId: order.id,
          fieldName: 'revision_request_sections',
          fieldValue: sections.join(','),
        },
        {
          orderId: order.id,
          fieldName: 'revision_request_notes',
          fieldValue: notes,
        },
        {
          orderId: order.id,
          fieldName: 'revision_request_timestamp',
          fieldValue: new Date().toISOString(),
        },
        {
          orderId: order.id,
          fieldName: 'latest_revision_status',
          fieldValue: 'pending',
        },
      ],
    });

    // Update order status to indicate revision in progress
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'in_revision',
        updatedAt: new Date(),
      },
    });

    // Log revision request
    console.log(`Revision request created: ${revisionId} for order ${order.id}`);
    console.log(`Sections to revise: ${sections.join(', ')}`);
    console.log(`Notes: ${notes}`);

    // In production, would send email to admin about revision request
    // For now, just log it

    return NextResponse.json({
      success: true,
      message: 'Revision request submitted successfully',
      revisionId,
    });
  } catch (error) {
    console.error('Error submitting revision request:', error);
    return NextResponse.json(
      {
        error: 'Failed to submit revision request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};
