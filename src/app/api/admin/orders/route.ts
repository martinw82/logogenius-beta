import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const handler = async (request: NextRequest) => {
  const { verifyAdminMiddleware } = await import('@/lib/middleware/verify-admin');
  const { getPrisma } = await import('@/lib/db');

  try {
    // Verify admin session
    const session = await verifyAdminMiddleware(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrisma();

    // Get query parameters for filtering and pagination
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const tier = searchParams.get('tier');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '25');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortDir = searchParams.get('sortDir') || 'desc';
    const search = searchParams.get('search');

    // Build filters
    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    if (tier && tier !== 'all') {
      where.tier = tier;
    }

    if (search) {
      where.customerEmail = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Get total count
    const total = await prisma.order.count({ where });

    // Get orders with pagination and sorting
    const sortOptions: any = {};
    if (sortBy === 'createdAt') {
      sortOptions.createdAt = sortDir === 'asc' ? 'asc' : 'desc';
    } else if (sortBy === 'status') {
      sortOptions.status = sortDir === 'asc' ? 'asc' : 'desc';
    } else if (sortBy === 'tier') {
      sortOptions.tier = sortDir === 'asc' ? 'asc' : 'desc';
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        details: {
          select: {
            fieldName: true,
            fieldValue: true,
          },
        },
      },
      orderBy: sortOptions,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Transform orders for response
    const formattedOrders = orders.map((order) => {
      const details: Record<string, any> = {};
      order.details.forEach((detail) => {
        details[detail.fieldName] = detail.fieldValue;
      });

      return {
        id: order.id,
        tier: order.tier,
        status: order.status,
        customerEmail: order.customerEmail,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        businessName: details.businessName,
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
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};

export const GET = handler;
