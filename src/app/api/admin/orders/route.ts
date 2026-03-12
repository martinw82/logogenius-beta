import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, createOrder, createOrderDetails } from '@/lib/database';
import { verifyAdminToken, getTokenFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Helper to verify auth
async function verifyAuth(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return { error: 'Unauthorized - No token provided', status: 401 };
  }

  const admin = await verifyAdminToken(token);
  if (!admin) {
    return { error: 'Unauthorized - Invalid token', status: 401 };
  }

  return { admin };
}

// GET /api/admin/orders - List orders
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if ('error' in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
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

// POST /api/admin/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if ('error' in auth) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const body = await request.json();
    const { tier, customerEmail, orderData } = body;

    // Validate required fields
    if (!tier || !['basic', 'pro', 'premium'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier specified' },
        { status: 400 }
      );
    }

    if (!customerEmail || !orderData?.businessName) {
      return NextResponse.json(
        { error: 'Customer email and business name are required' },
        { status: 400 }
      );
    }

    // Create order details array
    const details = [
      { fieldName: 'businessName', fieldValue: orderData.businessName },
      { fieldName: 'industry', fieldValue: orderData.industry || '' },
      { fieldName: 'customerEmail', fieldValue: customerEmail },
    ];

    if (orderData.brandArchetype) {
      details.push({ fieldName: 'brandArchetype', fieldValue: orderData.brandArchetype });
    }
    if (orderData.mission) {
      details.push({ fieldName: 'mission', fieldValue: orderData.mission });
    }
    if (orderData.pillars) {
      details.push({ fieldName: 'pillars', fieldValue: orderData.pillars });
    }
    if (orderData.targetAudience) {
      details.push({ fieldName: 'targetAudience', fieldValue: orderData.targetAudience });
    }
    if (orderData.logoPreferences) {
      details.push({ fieldName: 'logoPreferences', fieldValue: orderData.logoPreferences });
    }
    if (orderData.web3) {
      details.push({ fieldName: 'web3', fieldValue: 'true' });
    }

    // Create order
    const order = await createOrder({
      tier,
      customerEmail,
      status: 'pending',
      details,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      tier: order.tier,
      status: order.status,
    }, { status: 201 });

  } catch (error) {
    console.error('Create order API error:', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: String(error) },
      { status: 500 }
    );
  }
}
