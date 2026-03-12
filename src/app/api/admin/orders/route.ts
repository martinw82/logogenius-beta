import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // TEMP: Return empty orders due to TiDB SSL issues
    return NextResponse.json({
      orders: [],
      pagination: {
        total: 0,
        page: 1,
        pageSize: 25,
        pages: 0,
      },
    });

    /* Original code - disabled due to TiDB SSL issues
    const { getPrisma } = await import('@/lib/database');
    const prisma = getPrisma();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const tier = searchParams.get('tier');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '25');
    const search = searchParams.get('search');

    const where: any = {};
    if (status && status !== 'all') where.status = status;
    if (tier && tier !== 'all') where.tier = tier;
    if (search) {
      where.customerEmail = { contains: search, mode: 'insensitive' };
    }

    const total = await prisma.order.count({ where });

    const orders = await prisma.order.findMany({
      where,
      include: {
        details: {
          select: { fieldName: true, fieldValue: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const formattedOrders = orders.map((order: any) => {
      const details: Record<string, any> = {};
      order.details.forEach((detail: any) => {
        details[detail.fieldName] = detail.fieldValue;
      });

      return {
        id: order.id,
        tier: order.tier,
        status: order.status,
        customerEmail: order.customerEmail,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        businessName: details.businessName || '-',
        hasAssets: !!details.pdf_path,
      };
    });

    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        total,
        page,
        pageSize,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: String(error) },
      { status: 500 }
    );
  }
}
