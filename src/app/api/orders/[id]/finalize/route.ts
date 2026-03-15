import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrder, getPrisma } from "@/lib/database";
import { verifyAdminToken, getTokenFromRequest } from "@/lib/auth";
import { processOrderAssets } from "@/lib/services/order-processor";

export const dynamic = 'force-dynamic';

/**
 * POST /api/orders/[id]/finalize
 * 
 * Phase 2: Generate social assets and PDF with the SELECTED logo variant
 * This should be called AFTER admin picks their preferred logo
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`[Finalize] Request received for order ${params.id}`);
  
  try {
    // Verify admin authentication
    const token = getTokenFromRequest(request);
    console.log(`[Finalize] Token present: ${!!token}`);
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

    // Parse request body
    const body = await request.json();
    const { selectedVariant } = body;

    if (!selectedVariant || selectedVariant < 1 || selectedVariant > 4) {
      return NextResponse.json(
        { error: "Invalid logo variant. Must be 1-4." },
        { status: 400 }
      );
    }

    // Get order data
    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check order status
    if (order.status !== 'awaiting_selection' && order.status !== 'ready_for_review') {
      return NextResponse.json(
        { error: `Order status is ${order.status}. Cannot finalize.` },
        { status: 400 }
      );
    }

    // Convert order details to form data object
    const formData: Record<string, string> = {};
    for (const detail of order.details) {
      formData[detail.fieldName] = detail.fieldValue;
    }

    // Get API key
    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Together AI API key not configured" },
        { status: 500 }
      );
    }

    // Get the selected logo URL
    const logoUrlKey = `logoUrl_${selectedVariant - 1}`;
    const selectedLogoUrl = formData[logoUrlKey];

    if (!selectedLogoUrl) {
      return NextResponse.json(
        { error: `Logo variant ${selectedVariant} not found` },
        { status: 404 }
      );
    }

    console.log(`[Finalize] Order ${orderId} - Selected variant ${selectedVariant}`);

    // Save the selected logo to order
    const prisma = getPrisma();
    await prisma.order.update({
      where: { id: orderId },
      data: { 
        selectedLogoId: selectedVariant,
        status: 'finalizing',
      },
    });

    // Note: Social assets are now generated client-side before this API call
    console.log(`[Finalize] Social assets should already be generated client-side`);

    // Generate PDF and ZIP with selected logo
    console.log(`[Finalize] Generating PDF with variant ${selectedVariant}`);
    let pdfGenerated = false;
    let pdfPath = null;
    try {
      const result = await processOrderAssets({
        orderId: orderId,
        businessName: formData.businessName,
        userApiKey: apiKey,
      });
      
      if (result.success && result.pdfPath) {
        console.log(`[Finalize] PDF generated: ${result.pdfPath}`);
        pdfGenerated = true;
        pdfPath = result.pdfPath;
      } else {
        console.error(`[Finalize] PDF generation returned success=${result.success}, pdfPath=${result.pdfPath}`);
      }
    } catch (pdfError) {
      console.error("[Finalize] PDF generation failed:", pdfError);
    }
    
    // Verify PDF was saved by checking database
    try {
      const prismaClient = getPrisma();
      const pdfDetail = await prismaClient.orderDetail.findUnique({
        where: {
          orderId_fieldName: {
            orderId: orderId,
            fieldName: 'pdf_path',
          },
        },
      });
      if (pdfDetail?.fieldValue) {
        console.log(`[Finalize] PDF verified in database: ${pdfDetail.fieldValue}`);
        pdfGenerated = true;
        pdfPath = pdfDetail.fieldValue;
      } else {
        console.error(`[Finalize] PDF NOT found in database`);
      }
    } catch (verifyError) {
      console.error(`[Finalize] Error verifying PDF:`, verifyError);
    }

    // Update order status - use 'generation_failed' if PDF didn't generate
    if (pdfGenerated) {
      await updateOrder(orderId, { status: "ready_for_review" });
      return NextResponse.json({
        success: true,
        orderId,
        selectedVariant,
        status: "ready_for_review",
        pdfPath,
        message: "Order finalized with selected logo",
      });
    } else {
      await updateOrder(orderId, { status: "generation_failed" });
      return NextResponse.json({
        success: false,
        orderId,
        selectedVariant,
        status: "generation_failed",
        message: "PDF generation failed. Please try again.",
      }, { status: 500 });
    }

  } catch (error) {
    console.error("[Finalize] Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';
    console.error("[Finalize] Stack:", errorStack);
    return NextResponse.json(
      { error: "Failed to finalize order", details: errorMessage },
      { status: 500 }
    );
  }
}
