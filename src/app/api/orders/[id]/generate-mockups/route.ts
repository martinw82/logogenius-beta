import { NextRequest, NextResponse } from "next/server";
import { getPrisma, getOrderById } from "@/lib/database";
import { verifyAdminToken, getTokenFromRequest } from "@/lib/auth";
import { generateAIMockups } from "@/lib/services/ai-mockup-generator";

export const dynamic = 'force-dynamic';

/**
 * POST /api/orders/[id]/generate-mockups
 * 
 * Generate photorealistic mockups (t-shirt, mug, tote) using the selected logo.
 * This is called during Step 2 after logos are generated.
 * The mockups are saved to OrderDetail and reused during finalization.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`[Generate Mockups] Request received for order ${params.id}`);
  
  try {
    // Verify admin authentication
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    const admin = await verifyAdminToken(token);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // Get order data
    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Extract order data
    const orderData: Record<string, string> = {};
    for (const detail of order.details) {
      orderData[detail.fieldName] = detail.fieldValue;
    }

    // Get selected logo (or default to variant 1)
    const selectedLogoId = order.selectedLogoId || 1;
    
    // Get logo from LogoVariant table
    const prisma = getPrisma();
    const logoVariant = await prisma.logoVariant.findFirst({
      where: { orderId: orderId, variantNum: selectedLogoId },
    });

    if (!logoVariant?.svgData) {
      return NextResponse.json(
        { error: `Logo variant ${selectedLogoId} not found` },
        { status: 404 }
      );
    }

    // Check if mockups already exist (avoid regenerating)
    const existingMockups = await prisma.orderDetail.findFirst({
      where: { orderId: orderId, fieldName: 'ai_mockup_tshirt' },
    });

    if (existingMockups?.fieldValue) {
      console.log(`[Generate Mockups] Mockups already exist for order ${orderId}, skipping generation`);
      return NextResponse.json({
        success: true,
        message: "Mockups already exist, using cached version",
        cached: true,
        orderId,
      });
    }

    // Extract colors
    const colors = [
      orderData.primaryColors?.match(/#[0-9A-Fa-f]{6}/)?.[0] || '#2563eb',
      orderData.secondaryColors?.match(/#[0-9A-Fa-f]{6}/)?.[0] || '#1e40af',
      orderData.accentColors?.match(/#[0-9A-Fa-f]{6}/)?.[0] || '#f59e0b',
    ];

    console.log(`[Generate Mockups] Generating for order ${orderId} with logo variant ${selectedLogoId}`);

    // Generate mockups
    const mockups = await generateAIMockups({
      businessName: orderData.businessName || 'Brand',
      brandColors: colors,
      industry: orderData.industry || 'business',
      logoStyle: orderData.logoStyle,
      logoUrl: logoVariant.svgData,
    });

    // Save mockups to OrderDetail
    const mockupFields = [
      { fieldName: 'ai_mockup_tshirt', fieldValue: mockups.tshirt },
      { fieldName: 'ai_mockup_mug', fieldValue: mockups.coffeeMug },
      { fieldName: 'ai_mockup_tote', fieldValue: mockups.toteBag },
    ];

    for (const field of mockupFields) {
      await prisma.orderDetail.upsert({
        where: {
          orderId_fieldName: { orderId, fieldName: field.fieldName },
        },
        update: { fieldValue: field.fieldValue },
        create: { orderId, ...field },
      });
    }

    console.log(`[Generate Mockups] Saved mockups for order ${orderId}`);

    return NextResponse.json({
      success: true,
      message: "Mockups generated successfully",
      cached: false,
      orderId,
      mockups: {
        tshirt: !!mockups.tshirt,
        mug: !!mockups.coffeeMug,
        tote: !!mockups.toteBag,
      },
    });

  } catch (error) {
    console.error("[Generate Mockups] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate mockups", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
