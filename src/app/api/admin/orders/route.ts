import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Return empty orders (database disabled for now)
    return NextResponse.json({
      orders: [],
      pagination: {
        total: 0,
        page: 1,
        pageSize: 25,
        pages: 0,
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
