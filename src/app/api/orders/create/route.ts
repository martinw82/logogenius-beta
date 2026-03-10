import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { uuidv4 } from "@/utils";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tier } = body;

    // Validate tier
    if (!tier || !["basic", "pro", "premium"].includes(tier)) {
      return NextResponse.json(
        { error: "Invalid tier specified" },
        { status: 400 }
      );
    }

    // Create new order
    const orderId = uuidv4();
    const order = await prisma.order.create({
      data: {
        id: orderId,
        tier: tier as "basic" | "pro" | "premium",
        status: "pending",
        customerEmail: "", // Will be filled in from form
      },
    });

    // Generate form URL based on tier
    const tierNumber = tier === "basic" ? "1" : tier === "pro" ? "2" : "3";
    const formUrl = `/orders/${order.id}/tier${tierNumber}-form`;

    return NextResponse.json(
      {
        orderId: order.id,
        tier: order.tier,
        formUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
