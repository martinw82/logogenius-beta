import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders } from '@/lib/database';
import { verifyAdminToken, getTokenFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication - check both headers and cookies
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const admin = await verifyAdminToken(token);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '25');
    const status = searchParams.get('status');
    const tier = searchParams.get('tier');

    // Fetch orders from database
    const allOrders = await getAllOrders();
    
    // Filter orders if needed
    let filteredOrders = allOrders;
    if (status) {
      filteredOrders = filteredOrders.filter(o => o.status === status);
    }
    if (tier) {
      filteredOrders = filteredOrders.filter(o => o.tier === tier);
    }

    // Paginate
    const total = filteredOrders.length;
    const pages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const paginatedOrders = filteredOrders.slice(start, start + pageSize);

    return NextResponse.json({
      orders: paginatedOrders,
      pagination: {
        total,
        page,
        pageSize,
        pages,
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
