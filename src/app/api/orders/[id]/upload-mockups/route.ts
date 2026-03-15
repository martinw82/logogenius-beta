import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrder, prisma } from "@/lib/database";
import { verifyAdminToken, getTokenFromRequest } from "@/lib/auth";

export const dynamic = 'force-dynamic';

/**
 * POST /api/orders/[id]/upload-mockups
 * 
 * Receive client-side rendered mockups and social assets
 * Stores them in OrderDetail and LogoVariant tables
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Parse the uploaded data
    const body = await request.json();
    const { mockups, socialAssets, variantNum = 1 } = body;

    console.log(`[Upload Mockups] Received for order ${orderId}:`, {
      mockupCount: mockups ? Object.keys(mockups).length : 0,
      socialCount: socialAssets ? Object.keys(socialAssets).length : 0,
      variantNum,
    });

    // Verify order exists
    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const results = {
      mockupsSaved: 0,
      socialSaved: 0,
    };

    // Store mockups in OrderDetail
    if (mockups && typeof mockups === 'object') {
      for (const [template, imageData] of Object.entries(mockups)) {
        if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
          // Store in OrderDetail
          await prisma.orderDetail.upsert({
            where: {
              orderId_fieldName: {
                orderId: orderId,
                fieldName: `mockup_${template}`,
              },
            },
            create: {
              orderId: orderId,
              fieldName: `mockup_${template}`,
              fieldValue: imageData,
            },
            update: {
              fieldValue: imageData,
            },
          });
          results.mockupsSaved++;
        }
      }

      // Also store mockup paths in LogoVariant for display
      const mockupPaths: Record<string, string> = {};
      for (const [template, imageData] of Object.entries(mockups)) {
        if (typeof imageData === 'string') {
          mockupPaths[template] = imageData;
        }
      }

      if (Object.keys(mockupPaths).length > 0) {
        await prisma.logoVariant.updateMany({
          where: {
            orderId: orderId,
            variantNum: variantNum,
          },
          data: {
            mockupPaths: JSON.stringify(mockupPaths),
          },
        });
      }
    }

    // Store social assets in OrderDetail (Tier 3 only)
    if (socialAssets && typeof socialAssets === 'object') {
      for (const [platform, imageData] of Object.entries(socialAssets)) {
        if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
          // platform already includes 'social_' prefix from PLATFORM_KEY_MAP
          // so we use it directly without adding another prefix
          const fieldName = platform.startsWith('social_') ? platform : `social_${platform}`;
          
          await prisma.orderDetail.upsert({
            where: {
              orderId_fieldName: {
                orderId: orderId,
                fieldName: fieldName,
              },
            },
            create: {
              orderId: orderId,
              fieldName: fieldName,
              fieldValue: imageData,
            },
            update: {
              fieldValue: imageData,
            },
          });
          results.socialSaved++;
        }
      }
    }

    console.log(`[Upload Mockups] Saved for order ${orderId}:`, results);

    return NextResponse.json({
      success: true,
      orderId,
      results,
    });

  } catch (error) {
    console.error("[Upload Mockups] Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to upload mockups",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
