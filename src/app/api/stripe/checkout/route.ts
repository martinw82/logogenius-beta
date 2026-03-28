import { NextRequest, NextResponse } from "next/server";

// Map internal tier IDs to Stripe Price ID env vars
const TIER_PRICE_MAP: Record<string, string> = {
  basic: "STRIPE_PRICE_STARTER",
  pro: "STRIPE_PRICE_PRO",
  premium: "STRIPE_PRICE_ENTERPRISE",
};

const VALID_TIERS = ["basic", "pro", "premium"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tier, customerEmail } = body;

    // Validate tier
    if (!tier || !VALID_TIERS.includes(tier)) {
      return NextResponse.json(
        { error: "Invalid tier. Must be: basic, pro, or premium" },
        { status: 400 }
      );
    }

    // Get Stripe Price ID from env vars
    const priceEnvVar = TIER_PRICE_MAP[tier];
    const priceId = process.env[priceEnvVar];
    if (!priceId) {
      console.error(`Missing env var: ${priceEnvVar}`);
      return NextResponse.json(
        { error: "Stripe price not configured for this tier" },
        { status: 500 }
      );
    }

    // Initialize Stripe
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    // Get base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/tiers`,
      metadata: {
        tier,
        customerEmail: customerEmail || "",
      },
      customer_email: customerEmail || undefined,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
