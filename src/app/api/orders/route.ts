import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { prisma } = await import("@/lib/database");
    const { searchParams } = new URL(request.url);
    const stripeSessionId = searchParams.get("stripeSessionId");

    if (stripeSessionId) {
      // Lookup by Stripe session ID
      const order = await prisma.order.findFirst({
        where: { stripeSessionId },
      });

      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        id: order.id,
        tier: order.tier,
        status: order.status,
        customerEmail: order.customerEmail,
        amount: order.amount,
        paymentStatus: order.paymentStatus,
      });
    }

    // No query params — return error
    return NextResponse.json(
      { error: "Missing stripeSessionId query parameter" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Order lookup error:", error);
    return NextResponse.json(
      { error: "Failed to lookup order" },
      { status: 500 }
    );
  }
}
