import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export const POST = async (
  request: NextRequest,
  { params }: { params: { token: string } }
) => {
  try {
    const { getPrisma } = await import('@/lib/db');
    const { rating, feedback } = await request.json();

    const token = params.token;

    if (!token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
    }

    if (feedback && feedback.length > 500) {
      return NextResponse.json({ error: 'Feedback too long (max 500 characters)' }, { status: 400 });
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

    // Check if feedback already exists for this order
    const existingFeedback = await prisma.orderDetail.findFirst({
      where: {
        orderId: order.id,
        fieldName: 'customer_feedback_rating',
      },
    });

    if (existingFeedback) {
      return NextResponse.json(
        { error: 'Feedback already submitted for this order' },
        { status: 409 }
      );
    }

    // Store feedback in OrderDetail table
    await prisma.orderDetail.createMany({
      data: [
        {
          orderId: order.id,
          fieldName: 'customer_feedback_rating',
          fieldValue: rating.toString(),
        },
        {
          orderId: order.id,
          fieldName: 'customer_feedback_text',
          fieldValue: feedback || '',
        },
        {
          orderId: order.id,
          fieldName: 'customer_feedback_timestamp',
          fieldValue: new Date().toISOString(),
        },
      ],
    });

    // In production, would send email to admin notifying about feedback
    // For now, just log it
    console.log(`New feedback received for order ${order.id}: ${rating} stars - "${feedback}"`);

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      {
        error: 'Failed to submit feedback',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};
