import { getPrisma } from '../db';

export interface OrderMetrics {
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  ordersByTier: Record<string, number>;
  averageApprovalTime: number;
  rejectionRate: number;
  completionRate: number;
}

export interface CustomerFeedback {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  commonThemes: string[];
}

export interface AnalyticsDashboard {
  timeRange: {
    startDate: Date;
    endDate: Date;
  };
  ordersPerDay: Array<{
    date: string;
    count: number;
  }>;
  ordersPerWeek: Array<{
    week: string;
    count: number;
  }>;
  metrics: OrderMetrics;
  feedback: CustomerFeedback;
  topArchetypes: Array<{
    name: string;
    count: number;
  }>;
  topBusinesses: Array<{
    name: string;
    count: number;
  }>;
}

export async function getAdminAnalytics(
  startDate?: Date,
  endDate?: Date
): Promise<AnalyticsDashboard> {
  const prisma = getPrisma();

  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
  const end = endDate || new Date();

  // Fetch all orders in date range
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      details: true,
    },
  });

  // Calculate metrics
  const metrics = calculateMetrics(orders);
  const feedback = await calculateFeedback(prisma);
  const ordersPerDay = calculateOrdersPerDay(orders);
  const ordersPerWeek = calculateOrdersPerWeek(orders);
  const topArchetypes = calculateTopArchetypes(orders);
  const topBusinesses = calculateTopBusinesses(orders);

  return {
    timeRange: { startDate: start, endDate: end },
    ordersPerDay,
    ordersPerWeek,
    metrics,
    feedback,
    topArchetypes,
    topBusinesses,
  };
}

function calculateMetrics(orders: any[]): OrderMetrics {
  const statuses: Record<string, number> = {};
  const tiers: Record<string, number> = {};
  let totalApprovalTime = 0;
  let approvedCount = 0;
  let rejectedCount = 0;

  orders.forEach((order) => {
    // Count by status
    statuses[order.status] = (statuses[order.status] || 0) + 1;

    // Count by tier
    tiers[order.tier] = (tiers[order.tier] || 0) + 1;

    // Calculate approval time (time from created to approved)
    if (order.status === 'approved' && order.approvedAt) {
      const approvalTime = (order.approvedAt as any).getTime() - order.createdAt.getTime();
      totalApprovalTime += approvalTime;
      approvedCount++;
    }

    if (order.status === 'rejected') {
      rejectedCount++;
    }
  });

  const averageApprovalTime = approvedCount > 0 ? totalApprovalTime / approvedCount / 1000 / 60 : 0;
  const rejectionRate = orders.length > 0 ? (rejectedCount / orders.length) * 100 : 0;
  const completionRate = orders.length > 0 ? ((approvedCount + rejectedCount) / orders.length) * 100 : 0;

  return {
    totalOrders: orders.length,
    ordersByStatus: statuses,
    ordersByTier: tiers,
    averageApprovalTime: Math.round(averageApprovalTime * 10) / 10,
    rejectionRate: Math.round(rejectionRate * 10) / 10,
    completionRate: Math.round(completionRate * 10) / 10,
  };
}

async function calculateFeedback(prisma: any): Promise<CustomerFeedback> {
  const feedbackRecords = await prisma.orderDetail.findMany({
    where: {
      fieldName: 'customer_rating',
    },
  });

  const ratings: number[] = [];
  const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  feedbackRecords.forEach((record) => {
    const rating = parseInt(record.fieldValue);
    if (rating >= 1 && rating <= 5) {
      ratings.push(rating);
      ratingDistribution[rating]++;
    }
  });

  const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  return {
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews: ratings.length,
    ratingDistribution,
    commonThemes: extractCommonThemes(feedbackRecords),
  };
}

function extractCommonThemes(feedbackRecords: any[]): string[] {
  const feedbackTexts = feedbackRecords
    .filter((r) => r.fieldName === 'customer_feedback')
    .map((r) => r.fieldValue);

  // Simple keyword extraction
  const keywords: Record<string, number> = {};
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'is', 'was', 'are', 'were', 'be'];

  feedbackTexts.forEach((text: string) => {
    const words = text.toLowerCase().split(/\s+/);
    words.forEach((word: string) => {
      const cleanWord = word.replace(/[^a-z0-9]/g, '');
      if (cleanWord.length > 3 && !commonWords.includes(cleanWord)) {
        keywords[cleanWord] = (keywords[cleanWord] || 0) + 1;
      }
    });
  });

  return Object.entries(keywords)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

function calculateOrdersPerDay(orders: any[]): Array<{ date: string; count: number }> {
  const dayMap: Record<string, number> = {};

  orders.forEach((order) => {
    const date = order.createdAt.toISOString().split('T')[0];
    dayMap[date] = (dayMap[date] || 0) + 1;
  });

  return Object.entries(dayMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function calculateOrdersPerWeek(orders: any[]): Array<{ week: string; count: number }> {
  const weekMap: Record<string, number> = {};

  orders.forEach((order) => {
    const date = new Date(order.createdAt);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toISOString().split('T')[0];
    weekMap[weekKey] = (weekMap[weekKey] || 0) + 1;
  });

  return Object.entries(weekMap)
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => a.week.localeCompare(b.week));
}

function calculateTopArchetypes(orders: any[]): Array<{ name: string; count: number }> {
  const archetypeMap: Record<string, number> = {};

  orders.forEach((order) => {
    const archetype = order.details
      .find((d: any) => d.fieldName === 'archetype')
      ?.fieldValue;
    if (archetype) {
      archetypeMap[archetype] = (archetypeMap[archetype] || 0) + 1;
    }
  });

  return Object.entries(archetypeMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function calculateTopBusinesses(orders: any[]): Array<{ name: string; count: number }> {
  const businessMap: Record<string, number> = {};

  orders.forEach((order) => {
    const businessName = order.details
      .find((d: any) => d.fieldName === 'businessName')
      ?.fieldValue;
    if (businessName) {
      businessMap[businessName] = (businessMap[businessName] || 0) + 1;
    }
  });

  return Object.entries(businessMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export interface BulkActionInput {
  orderIds: number[];
  action: 'approve' | 'reject' | 'archive' | 'assign-reviewer';
  assignTo?: string;
}

export async function performBulkAction(input: BulkActionInput): Promise<{
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
}> {
  const prisma = getPrisma();
  const errors: string[] = [];
  let processed = 0;
  let failed = 0;

  for (const orderId of input.orderIds) {
    try {
      switch (input.action) {
        case 'approve':
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'approved',
              approvedAt: new Date(),
            },
          });
          processed++;
          break;

        case 'reject':
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'rejected',
              rejectedAt: new Date(),
            },
          });
          processed++;
          break;

        case 'archive':
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: 'archived',
            },
          });
          processed++;
          break;

        case 'assign-reviewer':
          if (!input.assignTo) {
            throw new Error('Reviewer name required for assign action');
          }
          await prisma.orderDetail.upsert({
            where: {
              orderId_fieldName: {
                orderId,
                fieldName: 'assigned_reviewer',
              },
            },
            update: { fieldValue: input.assignTo },
            create: {
              orderId,
              fieldName: 'assigned_reviewer',
              fieldValue: input.assignTo,
            },
          });
          processed++;
          break;
      }
    } catch (error) {
      failed++;
      errors.push(`Order ${orderId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    success: failed === 0,
    processed,
    failed,
    errors,
  };
}
