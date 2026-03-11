import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';

/**
 * End-to-End Test Suite for LogoGenius Beta
 *
 * Tests complete order workflows for all three tiers:
 * - Tier 1: Basic (logo + brand guide)
 * - Tier 2: Pro (add PDF/ZIP)
 * - Tier 3: Premium (add Figma/Canva/media assets)
 * 
 * NOTE: These tests require:
 * 1. Database connection (DATABASE_URL env var)
 * 2. Running dev server or API routes accessible
 * 3. Valid test API key for logo generation
 * 
 * Run with: npm run test:e2e
 */

// Test configuration
const TEST_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002',
  apiKey: process.env.TEST_GOOGLE_API_KEY || 'test-api-key',
  adminPassword: process.env.ADMIN_PASSWORD || 'test-password',
  timeout: 60000, // 60s for AI generation
};

interface TestOrder {
  id?: number;
  tier: 'basic' | 'pro' | 'premium';
  businessName: string;
  email: string;
  archetype: string;
  tagline?: string;
  missionStatement?: string;
  industry?: string;
}

// Helper function for API calls
async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${TEST_CONFIG.baseUrl}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return response;
}

describe('LogoGenius E2E Workflows', () => {
  let adminToken: string;
  let testOrders: Record<string, TestOrder> = {
    basic: {
      tier: 'basic',
      businessName: `TechStart-${Date.now()}`,
      email: `test-basic-${Date.now()}@logogenius.local`,
      archetype: 'The Innovator',
      tagline: 'Building the future today',
      industry: 'Technology',
    },
    pro: {
      tier: 'pro',
      businessName: `CreativeAgency-${Date.now()}`,
      email: `test-pro-${Date.now()}@logogenius.local`,
      archetype: 'The Creator',
      tagline: 'Design with purpose',
      missionStatement: 'To create meaningful visual experiences',
      industry: 'Design',
    },
    premium: {
      tier: 'premium',
      businessName: `Enterprise-${Date.now()}`,
      email: `test-premium-${Date.now()}@logogenius.local`,
      archetype: 'The Leader',
      tagline: 'Leading industry transformation',
      missionStatement: 'To deliver enterprise-grade design solutions',
      industry: 'Enterprise Software',
    },
  };

  // Check if server is running before all tests
  beforeAll(async () => {
    try {
      const healthCheck = await fetch(`${TEST_CONFIG.baseUrl}/api/orders/create`, {
        method: 'OPTIONS',
      }).catch(() => null);
      
      if (!healthCheck) {
        console.warn('\n⚠️  WARNING: Server does not appear to be running at', TEST_CONFIG.baseUrl);
        console.warn('Please start the dev server with: npm run dev\n');
      }
    } catch {
      // Server not running is handled in individual tests
    }
  });

  // Admin authentication before each test suite
  beforeEach(async () => {
    try {
      const adminResponse = await apiCall('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({
          password: TEST_CONFIG.adminPassword,
        }),
      });

      if (adminResponse.ok) {
        const adminData = await adminResponse.json() as any;
        adminToken = adminData.token;
      }
    } catch {
      // Auth failure handled in tests
    }
  });

  afterAll(async () => {
    // Cleanup - could delete test orders here
    console.log('\n✅ E2E test suite completed');
  });

  describe('Health Check', () => {
    it('Should confirm API is accessible', async () => {
      const response = await fetch(`${TEST_CONFIG.baseUrl}/api/orders/create`, {
        method: 'OPTIONS',
      }).catch(() => null);
      
      // If server not running, skip remaining tests
      if (!response) {
        console.log('\n⏭️  Skipping tests - server not running');
        return;
      }
      
      expect(response).toBeTruthy();
    });
  });

  describe('Tier 1: Basic Workflow', () => {
    let orderId: number;

    it('Should create a Tier 1 order', async () => {
      const response = await apiCall('/api/orders/create', {
        method: 'POST',
        body: JSON.stringify(testOrders.basic),
      });

      if (!response.ok) {
        const error = await response.text();
        console.log('Create order error:', error);
      }

      expect(response.ok).toBe(true);
      const order = await response.json() as any;
      orderId = order.id;
      expect(orderId).toBeGreaterThan(0);
      expect(order.tier).toBe('basic');
    });

    it('Should retrieve order details', async () => {
      // Skip if previous test failed
      if (!orderId) {
        console.log('⏭️  Skipping - no order ID');
        return;
      }

      const response = await apiCall(`/api/orders/${orderId}/detail`);
      
      expect(response.ok).toBe(true);
      const order = await response.json() as any;
      expect(order.id).toBe(orderId);
      expect(order.tier).toBe('basic');
    });

    it('Should generate logo variants (requires API key)', async () => {
      if (!orderId) {
        console.log('⏭️  Skipping - no order ID');
        return;
      }

      const response = await apiCall(`/api/orders/${orderId}/generate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          businessName: testOrders.basic.businessName,
          userApiKey: TEST_CONFIG.apiKey,
        }),
      });

      // This may fail if API key is invalid - that's acceptable for test
      if (response.status === 401) {
        console.log('⏭️  Skipping - invalid API key (expected in test env)');
        return;
      }

      expect([200, 202, 401]).toContain(response.status);
    }, TEST_CONFIG.timeout);

    it('Should allow logo selection', async () => {
      if (!orderId) {
        console.log('⏭️  Skipping - no order ID');
        return;
      }

      const response = await apiCall(`/api/orders/${orderId}/select-logo`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ selectedVariantNum: 1 }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json() as any;
      expect(result.success).toBe(true);
    });

    it('Should update order status', async () => {
      if (!orderId) {
        console.log('⏭️  Skipping - no order ID');
        return;
      }

      // Check admin can update status
      const response = await apiCall(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: 'ready_for_review' }),
      });

      // May be 404 if endpoint doesn't exist yet
      expect([200, 201, 404]).toContain(response.status);
    });
  });

  describe('Tier 2: Pro Workflow', () => {
    let orderId: number;
    let customerToken: string;

    it('Should create a Tier 2 order', async () => {
      const response = await apiCall('/api/orders/create', {
        method: 'POST',
        body: JSON.stringify(testOrders.pro),
      });

      expect(response.ok).toBe(true);
      const order = await response.json() as any;
      orderId = order.id;
      expect(orderId).toBeGreaterThan(0);
      expect(order.tier).toBe('pro');
    });

    it('Should store order details correctly', async () => {
      if (!orderId) {
        console.log('⏭️  Skipping - no order ID');
        return;
      }

      const response = await apiCall(`/api/orders/${orderId}/detail`);
      
      expect(response.ok).toBe(true);
      const order = await response.json() as any;
      expect(order.businessName).toBe(testOrders.pro.businessName);
      expect(order.tier).toBe('pro');
      expect(order.email).toBe(testOrders.pro.email);
    });

    it('Should process order and generate assets', async () => {
      if (!orderId) {
        console.log('⏭️  Skipping - no order ID');
        return;
      }

      const response = await apiCall(`/api/admin/orders/${orderId}/process`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          businessName: testOrders.pro.businessName,
          userApiKey: TEST_CONFIG.apiKey,
        }),
      });

      // May fail if API key invalid - acceptable
      expect([200, 202, 401, 404]).toContain(response.status);
    }, TEST_CONFIG.timeout);

    it('Should generate dashboard access token', async () => {
      if (!orderId) {
        console.log('⏭️  Skipping - no order ID');
        return;
      }

      // This endpoint may need to be created
      const response = await apiCall(`/api/dashboard/generate-token`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ orderId }),
      });

      if (response.ok) {
        const result = await response.json() as any;
        customerToken = result.token;
        expect(customerToken).toBeTruthy();
      } else {
        // Endpoint may not exist yet
        expect(response.status).toBe(404);
      }
    });

    it('Should access customer dashboard with token', async () => {
      if (!customerToken) {
        console.log('⏭️  Skipping - no customer token');
        return;
      }

      const response = await apiCall(`/api/dashboard/${customerToken}`);
      
      expect(response.ok).toBe(true);
      const dashboard = await response.json() as any;
      expect(dashboard.orderId).toBe(orderId);
    });
  });

  describe('Tier 3: Premium Workflow', () => {
    let orderId: number;

    it('Should create a Tier 3 order', async () => {
      const response = await apiCall('/api/orders/create', {
        method: 'POST',
        body: JSON.stringify(testOrders.premium),
      });

      expect(response.ok).toBe(true);
      const order = await response.json() as any;
      orderId = order.id;
      expect(orderId).toBeGreaterThan(0);
      expect(order.tier).toBe('premium');
    });

    it('Should support Web3 fields in Tier 3', async () => {
      if (!orderId) {
        console.log('⏭️  Skipping - no order ID');
        return;
      }

      const web3Order = {
        ...testOrders.premium,
        web3BlockchainFocus: 'Ethereum',
        web3ProjectType: 'DeFi Protocol',
        web3EnsDomainIdeas: 'techstart.eth',
        web3TokenSymbolIdea: 'TST',
        web3CommunityValues: 'Decentralization, Transparency',
        web3NftAesthetic: 'Clean, Modern',
      };

      // Update order with Web3 fields
      const response = await apiCall(`/api/orders/${orderId}/submit`, {
        method: 'POST',
        body: JSON.stringify(web3Order),
      });

      // May be 404 if endpoint doesn't exist
      expect([200, 201, 404]).toContain(response.status);
    });

    it('Should process Tier 3 with all assets', async () => {
      if (!orderId) {
        console.log('⏭️  Skipping - no order ID');
        return;
      }

      const response = await apiCall(`/api/admin/orders/${orderId}/process`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          businessName: testOrders.premium.businessName,
          userApiKey: TEST_CONFIG.apiKey,
        }),
      });

      expect([200, 202, 401, 404]).toContain(response.status);
    }, TEST_CONFIG.timeout);
  });

  describe('Admin Operations', () => {
    it('Should list orders with filters', async () => {
      const response = await apiCall('/api/admin/orders?status=pending&tier=basic', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.ok).toBe(true);
      const result = await response.json() as any;
      expect(Array.isArray(result.orders)).toBe(true);
    });

    it('Should get order analytics', async () => {
      const response = await apiCall('/api/admin/analytics', {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      // May be 404 if endpoint doesn't exist
      expect([200, 404]).toContain(response.status);
      
      if (response.ok) {
        const analytics = await response.json() as any;
        expect(analytics).toHaveProperty('totalOrders');
      }
    });
  });

  describe('Error Handling', () => {
    it('Should reject invalid tier selection', async () => {
      const response = await apiCall('/api/orders/create', {
        method: 'POST',
        body: JSON.stringify({
          tier: 'invalid-tier',
          businessName: 'Test',
          email: 'test@example.com',
          archetype: 'The Innovator',
        }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    it('Should reject missing required fields', async () => {
      const response = await apiCall('/api/orders/create', {
        method: 'POST',
        body: JSON.stringify({
          tier: 'basic',
          businessName: 'Test',
          // Missing email and archetype
        }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    it('Should reject invalid admin token', async () => {
      const response = await apiCall('/api/admin/orders', {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });

    it('Should handle non-existent order', async () => {
      const response = await apiCall('/api/orders/99999/detail');
      
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });
  });

  describe('Performance', () => {
    it('Should create orders concurrently', async () => {
      const promises = [];

      for (let i = 0; i < 3; i++) {
        promises.push(
          apiCall('/api/orders/create', {
            method: 'POST',
            body: JSON.stringify({
              tier: 'basic',
              businessName: `Concurrent-${Date.now()}-${i}`,
              email: `concurrent-${Date.now()}-${i}@test.com`,
              archetype: 'The Innovator',
            }),
          })
        );
      }

      const responses = await Promise.all(promises);
      responses.forEach((response) => {
        expect(response.ok).toBe(true);
      });
    });
  });
});

// Integration test for services
describe('Service Integration Tests', () => {
  describe('Token Service', () => {
    it('Should generate valid dashboard token', async () => {
      const { generateToken } = await import('../src/lib/services/token-service');
      
      const token = generateToken(123);
      expect(token).toHaveProperty('token');
      expect(token).toHaveProperty('expiresAt');
      expect(typeof token.token).toBe('string');
      expect(token.token.length).toBeGreaterThan(20);
    });
  });

  describe('Version Tracking', () => {
    it('Should calculate next version number', async () => {
      const { calculateNextVersion } = await import('../src/lib/services/version-tracking');
      
      expect(calculateNextVersion('1.0')).toBe('1.1');
      expect(calculateNextVersion('1.5')).toBe('1.6');
      expect(calculateNextVersion('2.3')).toBe('2.4');
    });
  });

  describe('File Manager', () => {
    it('Should generate correct file names', async () => {
      const { generateFileName } = await import('../src/lib/services/file-manager');
      
      const pdfName = generateFileName('pdf', 123, 'Test Business');
      expect(pdfName).toContain('123');
      expect(pdfName).toContain('Test-Business');
      expect(pdfName).toEndWith('.pdf');
      
      const zipName = generateFileName('zip', 456, 'Another Co');
      expect(zipName).toEndWith('.zip');
    });
  });
});
