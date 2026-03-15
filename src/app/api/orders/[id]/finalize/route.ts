import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrder, getPrisma } from "@/lib/database";
import { verifyAdminToken, getTokenFromRequest } from "@/lib/auth";
import { generateAllSocialAssets } from "@/lib/services/social-media-generator";
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
    await prisma.order.update({
      where: { id: orderId },
      data: { 
        selectedLogoId: selectedVariant,
        status: 'finalizing',
      },
    });

    // Generate social media assets for Tier 3
    console.log(`[Finalize] Checking tier: ${order.tier}`);
    if (order.tier === 'premium') {
      console.log(`[Finalize] Generating social assets for variant ${selectedVariant}`);
      console.log(`[Finalize] Logo URL length: ${selectedLogoUrl?.length || 0}`);
      console.log(`[Finalize] Business name: ${formData.businessName}`);
      
      try {
        const primaryColor = formData.primaryColors?.match(/#[0-9A-Fa-f]{6}/)?.[0] || '#0a192f';
        const secondaryColor = formData.secondaryColors?.match(/#[0-9A-Fa-f]{6}/)?.[0] || '#f4a261';
        const accentColor = formData.accentColors?.match(/#[0-9A-Fa-f]{6}/)?.[0] || '#ffffff';
        
        console.log(`[Finalize] Colors: primary=${primaryColor}, secondary=${secondaryColor}, accent=${accentColor}`);
        
        const socialResults = await generateAllSocialAssets({
          logoUrl: selectedLogoUrl,
          businessName: formData.businessName,
          tagline: formData.keyTagline,
          primaryColor,
          secondaryColor,
          accentColor,
        });
        
        console.log(`[Finalize] Social assets generated:`, Object.keys(socialResults).length);
        
        // Store social assets
        for (const [platform, imageUrl] of Object.entries(socialResults)) {
          if (imageUrl) {
            await prisma.orderDetail.upsert({
              where: {
                orderId_fieldName: {
                  orderId: orderId,
                  fieldName: `social_${platform}`,
                },
              },
              create: {
                orderId: orderId,
                fieldName: `social_${platform}`,
                fieldValue: imageUrl,
              },
              update: {
                fieldValue: imageUrl,
              },
            });
          }
        }
      } catch (socialError) {
        console.error("[Finalize] Social generation failed:", socialError);
        // Continue even if social fails - we still want to generate PDF
      }
    } else {
      console.log(`[Finalize] Skipping social assets - tier is ${order.tier}, not premium`);
    }

    // Generate PDF and ZIP with selected logo
    console.log(`[Finalize] Generating PDF with variant ${selectedVariant}`);
    let pdfGenerated = false;
    try {
      const result = await processOrderAssets({
        orderId: orderId,
        businessName: formData.businessName,
        userApiKey: apiKey,
      });
      
      if (result.success && result.pdfPath) {
        console.log(`[Finalize] PDF generated: ${result.pdfPath}`);
        pdfGenerated = true;
      } else {
        console.error(`[Finalize] PDF generation returned success=${result.success}, pdfPath=${result.pdfPath}`);
      }
    } catch (pdfError) {
      console.error("[Finalize] PDF generation failed:", pdfError);
    }
    
    // Verify PDF was saved
    try {
      const prisma = getPrisma();
      const pdfDetail = await prisma.orderDetail.findUnique({
        where: {
          orderId_fieldName: {
            orderId: orderId,
            fieldName: 'pdf_path',
          },
        },
      });
      console.log(`[Finalize] PDF in database: ${pdfDetail?.fieldValue || 'NOT FOUND'}`);
    } catch (verifyError) {
      console.error(`[Finalize] Error verifying PDF:`, verifyError);
    }

    // Update order status to ready for review
    await updateOrder(orderId, { status: "ready_for_review" });

    return NextResponse.json({
      success: true,
      orderId,
      selectedVariant,
      status: "ready_for_review",
      message: "Order finalized with selected logo",
    });

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
