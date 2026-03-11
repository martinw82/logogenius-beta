import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

/**
 * End-to-End Test Suite for LogoGenius Beta
 *
 * Tests complete order workflows for all three tiers:
 * - Tier 1: Basic (logo + brand guide)
 * - Tier 2: Pro (add PDF/ZIP)
 * - Tier 3: Premium (add Figma/Canva/media assets)
 */

interface TestOrder {
  id?: number;
  tier: 'basic' | 'pro' | 'premium';
  businessName: string;
  email: string;
  archetype: string;
  tagline?: string;
  missionStatement?: string;
}

describe('LogoGenius E2E Workflows', () => {
  let adminToken: string;
  let testOrders: Record<string, TestOrder> = {
    basic: {
      tier: 'basic',
      businessName: 'TechStart Innovations',
      email: 'test-basic@logogenius.local',
      archetype: 'The Innovator',
      tagline: 'Building the future today',
    },
    pro: {
      tier: 'pro',
      businessName: 'Creative Agency Pro',
      email: 'test-pro@logogenius.local',
      archetype: 'The Creator',
      tagline: 'Design with purpose',
      missionStatement: 'To create meaningful visual experiences',
    },
    premium: {
      tier: 'premium',
      businessName: 'Enterprise Solutions Premium',
      email: 'test-premium@logogenius.local',
      archetype: 'The Leader',
      tagline: 'Leading industry transformation',
      missionStatement: 'To deliver enterprise-grade design solutions',
    },
  };

  beforeAll(async () => {
    // Admin authentication
    const adminResponse = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: process.env.ADMIN_PASSWORD || 'test-password',
      }),
    });

    expect(adminResponse.ok).toBe(true);
    const adminData = await adminResponse.json() as any;
    adminToken = adminData.token;
  });

  describe('Tier 1: Basic Workflow', () => {
    let orderId: number;

    it('Should create a Tier 1 order', async () => {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testOrders.basic),
      });

      expect(response.ok).toBe(true);
      const order = await response.json() as any;
      orderId = order.id;
      expect(orderId).toBeGreaterThan(0);
    });

    it('Should generate logo variants for Tier 1', async () => {
      const response = await fetch(`/api/orders/${orderId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          businessName: testOrders.basic.businessName,
          userApiKey: 'test-api-key',
        }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json() as any;
      expect(result.success).toBe(true);
    });

    it('Should retrieve 4 logo variants', async () => {
      const response = await fetch(`/api/orders/${orderId}/detail`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(response.ok).toBe(true);
      const order = await response.json() as any;
      expect(order.logoVariants).toHaveLength(4);
      expect(order.logoVariants[0].svgPath).toBeTruthy();
    });

    it('Should allow logo selection', async () => {
      const response = await fetch(`/api/orders/${orderId}/select-logo`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ selectedVariantNum: 1 }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json() as any;
      expect(result.success).toBe(true);
    });

    it('Should approve order for customer access', async () => {
      const response = await fetch(`/api/admin/orders/${orderId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      });

      expect(response.ok).toBe(true);
    });

    it('Should generate customer dashboard token', async () => {
      const response = await fetch(`/api/orders/${orderId}/generate-token`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(response.ok).toBe(true);
      const result = await response.json() as any;
      expect(result.token).toBeTruthy();
      expect(result.expiresAt).toBeTruthy();
    });
  });

  describe('Tier 2: Pro Workflow', () => {
    let orderId: number;
    let customerToken: string;

    it('Should create a Tier 2 order', async () => {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testOrders.pro),
      });

      expect(response.ok).toBe(true);
      const order = await response.json() as any;
      orderId = order.id;
      expect(orderId).toBeGreaterThan(0);
    });

    it('Should generate assets for Tier 2', async () => {
      const response = await fetch(`/api/orders/${orderId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          businessName: testOrders.pro.businessName,
          userApiKey: 'test-api-key',
        }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json() as any;
      expect(result.success).toBe(true);
      expect(result.pdfPath).toBeTruthy();
      expect(result.zipPath).toBeTruthy();
    });

    it('Should download PDF for Tier 2', async () => {
      const tokenResponse = await fetch(`/api/orders/${orderId}/generate-token`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const tokenData = await tokenResponse.json() as any;
      customerToken = tokenData.token;

      const response = await fetch(`/api/orders/${orderId}/download/pdf?token=${customerToken}`);
      expect(response.ok).toBe(true);
      expect(response.headers.get('content-type')).toContain('application/pdf');
    });

    it('Should download ZIP for Tier 2', async () => {
      const response = await fetch(`/api/orders/${orderId}/download/zip?token=${customerToken}`);
      expect(response.ok).toBe(true);
      expect(response.headers.get('content-type')).toContain('application/zip');
    });

    it('Should support revision requests for Tier 2', async () => {
      const response = await fetch(`/api/orders/${orderId}/revisions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Customer-Token': customerToken,
        },
        body: JSON.stringify({
          section: 'brandVoice',
          feedback: 'Make it more approachable',
        }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json() as any;
      expect(result.revisionNumber).toBe(1);
    });

    it('Should track brand guide versions', async () => {
      const response = await fetch(`/api/orders/${orderId}/versions`, {
        headers: { 'X-Customer-Token': customerToken },
      });

      expect(response.ok).toBe(true);
      const versions = await response.json() as any;
      expect(versions.length).toBeGreaterThan(0);
      expect(versions[0].version).toBeDefined();
    });
  });

  describe('Tier 3: Premium Workflow', () => {
    let orderId: number;
    let customerToken: string;

    it('Should create a Tier 3 order', async () => {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testOrders.premium),
      });

      expect(response.ok).toBe(true);
      const order = await response.json() as any;
      orderId = order.id;
      expect(orderId).toBeGreaterThan(0);
    });

    it('Should generate all assets including Figma/Canva for Tier 3', async () => {
      const response = await fetch(`/api/orders/${orderId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          businessName: testOrders.premium.businessName,
          userApiKey: 'test-api-key',
        }),
      });

      expect(response.ok).toBe(true);
      const result = await response.json() as any;
      expect(result.success).toBe(true);
      expect(result.pdfPath).toBeTruthy();
      expect(result.zipPath).toBeTruthy();
      expect(result.figmaUrl).toBeTruthy();
      expect(result.canvaDesigns).toBeTruthy();
      expect(result.mediaAssets).toBeTruthy();
    });

    it('Should generate customer token for Tier 3', async () => {
      const response = await fetch(`/api/orders/${orderId}/generate-token`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const tokenData = await response.json() as any;
      customerToken = tokenData.token;
      expect(customerToken).toBeTruthy();
    });

    it('Should download all Tier 3 assets', async () => {
      const assets = ['pdf', 'zip', 'logos', 'mockups'];

      for (const asset of assets) {
        const response = await fetch(
          `/api/orders/${orderId}/download/${asset}?token=${customerToken}`
        );
        expect(response.ok).toBe(true);
      }
    });

    it('Should access Figma templates for Tier 3', async () => {
      const response = await fetch(`/api/orders/${orderId}/figma?token=${customerToken}`);
      expect(response.ok).toBe(true);
      const figmaData = await response.json() as any;
      expect(figmaData.fileUrl).toBeTruthy();
      expect(figmaData.editUrl).toBeTruthy();
    });

    it('Should access Canva templates for Tier 3', async () => {
      const response = await fetch(`/api/orders/${orderId}/canva?token=${customerToken}`);
      expect(response.ok).toBe(true);
      const canvaData = await response.json() as any;
      expect(canvaData.socialMedia).toBeDefined();
      expect(canvaData.printMaterials).toBeDefined();
      expect(canvaData.presentations).toBeDefined();
    });

    it('Should download media assets for Tier 3', async () => {
      const response = await fetch(`/api/orders/${orderId}/download/media?token=${customerToken}`);
      expect(response.ok).toBe(true);
    });

    it('Should support Tier 3 revision workflow', async () => {
      const response = await fetch(`/api/orders/${orderId}/revisions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Customer-Token': customerToken,
        },
        body: JSON.stringify({
          section: 'colorPalette',
          feedback: 'Add more accent colors',
        }),
      });

      expect(response.ok).toBe(true);
    });

    it('Should submit feedback and rating', async () => {
      const response = await fetch(`/api/orders/${orderId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Customer-Token': customerToken,
        },
        body: JSON.stringify({
          rating: 5,
          feedback: 'Excellent design work!',
        }),
      });

      expect(response.ok).toBe(true);
    });
  });

  describe('Cross-Tier Features', () => {
    it('Should validate logo mockups display correctly', async () => {
      const response = await fetch('/api/mockups/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          logoUrl: 'data:image/svg+xml;base64,test',
          templates: ['letterhead', 'tshirt', 'businesscard'],
        }),
      });

      expect(response.ok).toBe(true);
    });

    it('Should handle email notifications', async () => {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          email: 'test@example.com',
          type: 'order-approved',
        }),
      });

      expect(response.ok).toBe(true);
    });

    it('Should validate admin order filters', async () => {
      const response = await fetch('/api/admin/orders?status=ready_for_review&tier=pro', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(response.ok).toBe(true);
      const result = await response.json() as any;
      expect(Array.isArray(result.orders)).toBe(true);
    });
  });

  describe('Performance & Load Testing', () => {
    it('Should generate logo under 30 seconds', async () => {
      const startTime = Date.now();

      const createResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...testOrders.basic,
          businessName: 'Performance Test ' + Math.random(),
        }),
      });

      const order = await createResponse.json() as any;
      const orderId = order.id;

      const generateResponse = await fetch(`/api/orders/${orderId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          businessName: testOrders.basic.businessName,
          userApiKey: 'test-api-key',
        }),
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(generateResponse.ok).toBe(true);
      expect(duration).toBeLessThan(30000);
    });

    it('Should handle concurrent order creation', async () => {
      const promises = [];

      for (let i = 0; i < 5; i++) {
        promises.push(
          fetch('/api/orders/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...testOrders.basic,
              businessName: `Concurrent Test ${i}`,
              email: `concurrent-${i}@logogenius.local`,
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

  describe('Error Handling', () => {
    it('Should reject invalid tier selection', async () => {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: 'basic',
          businessName: 'Test',
          // Missing email and archetype
        }),
      });

      expect(response.ok).toBe(false);
    });

    it('Should handle invalid tokens gracefully', async () => {
      const response = await fetch('/api/orders/1/dashboard?token=invalid-token');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });
  });

  afterAll(async () => {
    // Cleanup test data
    console.log('E2E tests completed');
  });
});
