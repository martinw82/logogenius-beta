// Database disabled due to TiDB SSL issues
// Return mock implementations

const mockPrisma = {
  order: { count: async () => 0, findMany: async () => [], findUnique: async () => null, create: async () => ({}), update: async () => ({}) },
  orderDetail: { findFirst: async () => null, findMany: async () => [], createMany: async () => ({}), upsert: async () => ({}), deleteMany: async () => ({}) },
  logoVariant: { findMany: async () => [], updateMany: async () => ({}) },
  adminSession: { create: async () => ({}), findUnique: async () => null, delete: async () => ({}) },
  $disconnect: async () => {},
};

export const prisma = mockPrisma as any;

export function getPrisma() {
  return mockPrisma as any;
}
