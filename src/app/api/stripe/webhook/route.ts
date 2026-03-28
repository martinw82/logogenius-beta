import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    if (!sig) {
      console.error("Webhook error: Missing stripe-signature header");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Initialize Stripe
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Always return 200 to prevent Stripe retries
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: {
  id: string;
  metadata: Record<string, string> | null;
  amount_total: number | null;
}) {
  const { prisma } = await import("@/lib/database");

  const tier = session.metadata?.tier;
  const customerEmail = session.metadata?.customerEmail;

  if (!tier) {
    console.warn(`Webhook: No tier in metadata for session ${session.id}`);
    return;
  }

  // Idempotency check — don't create duplicate orders
  const existingOrder = await prisma.order.findFirst({
    where: { stripeSessionId: session.id },
  });

  if (existingOrder) {
    console.log(
      `Order already exists for session ${session.id}, skipping`
    );
    return;
  }

  // Create order with payment data
  const order = await prisma.order.create({
    data: {
      tier,
      customerEmail: customerEmail || "",
      stripeSessionId: session.id,
      paymentStatus: "paid",
      amount: session.amount_total,
      status: "pending",
    },
  });

  console.log(`Order created: ${order.id} for session: ${session.id}`);
}
