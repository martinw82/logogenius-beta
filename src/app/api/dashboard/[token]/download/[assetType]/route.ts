import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export const GET = async (
  request: NextRequest,
  { params }: { params: { token: string; assetType: string } }
) => {
  try {
    const { getPrisma } = await import('@/lib/db');
    const token = params.token;
    const assetType = params.assetType;

    if (!token || !assetType) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const prisma = getPrisma();

    // Find order by token
    const detail = await prisma.orderDetail.findFirst({
      where: {
        fieldName: 'dashboard_token',
        fieldValue: token,
      },
      include: {
        order: {
          include: {
            details: true,
            logoVariants: true,
          },
        },
      },
    });

    if (!detail || !detail.order) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    const order = detail.order;

    // Verify order is completed
    if (order.status !== 'completed') {
      return NextResponse.json({ error: 'Order not yet completed' }, { status: 403 });
    }

    // Get the requested asset path from order details
    const assetPathField = order.details.find(
      (d) => d.fieldName === `${assetType}_path` || d.fieldName === assetType
    );

    if (!assetPathField || !assetPathField.fieldValue) {
      return NextResponse.json(
        { error: `Asset type ${assetType} not found for this order` },
        { status: 404 }
      );
    }

    const filePath = assetPathField.fieldValue as string;
    const absolutePath = path.join(process.cwd(), 'public', filePath);

    // Security: Ensure path is within public directory
    if (!absolutePath.startsWith(path.join(process.cwd(), 'public'))) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 403 });
    }

    // Check if file exists
    try {
      await fs.access(absolutePath);
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Read file
    const fileBuffer = await fs.readFile(absolutePath);

    // Determine content type
    const contentType = getContentType(assetType);

    // Set filename
    const filename = getFilename(assetType, order);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error downloading asset:', error);
    return NextResponse.json(
      {
        error: 'Failed to download asset',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};

function getContentType(assetType: string): string {
  switch (assetType) {
    case 'zip':
      return 'application/zip';
    case 'pdf':
      return 'application/pdf';
    case 'logos':
      return 'application/zip';
    case 'mockups':
      return 'application/zip';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

function getFilename(assetType: string, order: any): string {
  const businessName = order.details.find((d: any) => d.fieldName === 'businessName')?.fieldValue || 'brand';
  const timestamp = new Date().toISOString().split('T')[0];

  switch (assetType) {
    case 'zip':
      return `${businessName}-brand-package-${timestamp}.zip`;
    case 'pdf':
      return `${businessName}-brand-guide-${timestamp}.pdf`;
    case 'logos':
      return `${businessName}-logos-${timestamp}.zip`;
    case 'mockups':
      return `${businessName}-mockups-${timestamp}.zip`;
    default:
      return `${businessName}-${assetType}-${timestamp}`;
  }
}
