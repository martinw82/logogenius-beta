import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  tier1FormSchema,
  tier2FormSchema,
  tier3FormSchema,
  type Tier1FormData,
  type Tier2FormData,
  type Tier3FormData,
} from "@/lib/schemas/order-forms";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const contentType = request.headers.get("content-type") || "";

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let data: Tier1FormData | Tier2FormData | Tier3FormData;
    let file: File | undefined;

    // Parse request body based on content type
    if (contentType.includes("application/json")) {
      const body = await request.json();
      data = body.data;
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const dataString = formData.get("data") as string;
      data = JSON.parse(dataString);
      file = formData.get("file") as File | undefined;
    } else {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 }
      );
    }

    // Validate tier matches
    const requestedTier = data?.tier || order.tier;
    if (requestedTier !== order.tier) {
      return NextResponse.json(
        { error: "Tier mismatch" },
        { status: 400 }
      );
    }

    // Validate form data based on tier
    let validatedData;
    try {
      if (order.tier === "basic") {
        validatedData = tier1FormSchema.parse(data);
      } else if (order.tier === "pro") {
        validatedData = tier2FormSchema.parse(data);
      } else if (order.tier === "premium") {
        validatedData = tier3FormSchema.parse(data);
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid form data", details: error },
        { status: 400 }
      );
    }

    // Store form data in OrderDetail table
    const orderDetails = Object.entries(validatedData).map(([key, value]) => {
      let stringValue: string;

      if (value === null || value === undefined) {
        stringValue = "";
      } else if (typeof value === "string") {
        stringValue = value;
      } else if (typeof value === "boolean") {
        stringValue = value ? "true" : "false";
      } else if (Array.isArray(value)) {
        stringValue = JSON.stringify(value);
      } else {
        stringValue = JSON.stringify(value);
      }

      return {
        orderId,
        fieldName: key,
        fieldValue: stringValue,
      };
    });

    // Handle file upload if present
    let fileUrl: string | undefined;
    if (file) {
      try {
        const buffer = await file.arrayBuffer();
        const fileName = `${orderId}-${file.name}`;
        const uploadDir = process.cwd() + "/public/uploads";

        // Note: In production, use cloud storage like S3
        // For MVP, store in public/uploads directory
        const fs = require("fs").promises;
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(`${uploadDir}/${fileName}`, Buffer.from(buffer));

        fileUrl = `/uploads/${fileName}`;

        // Add file path to order details
        orderDetails.push({
          orderId,
          fieldName: "brandAssetsFile",
          fieldValue: fileUrl,
        });
      } catch (error) {
        console.error("File upload error:", error);
        // Don't fail the whole request if file upload fails
      }
    }

    // Clear existing order details (in case of re-submission)
    await prisma.orderDetail.deleteMany({
      where: { orderId },
    });

    // Create order details
    await prisma.orderDetail.createMany({
      data: orderDetails,
    });

    // Update order status and customer email
    const customerEmail = validatedData.businessName || "no-email";
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "processing",
        customerEmail,
      },
    });

    return NextResponse.json(
      {
        orderId: updatedOrder.id,
        confirmationUrl: `/orders/${updatedOrder.id}/confirmation`,
        message: "Order received!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Form submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit form" },
      { status: 500 }
    );
  }
}
