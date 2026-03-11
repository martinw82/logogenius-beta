/**
 * Jest Test Setup
 * 
 * This file runs before each test file.
 * Use it to set up test environment, mock services, etc.
 */

// Set test environment variables
process.env.DATABASE_URL = process.env.DATABASE_URL || 'mysql://test:test@localhost:3306/logogenius_test';
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'test-password';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';

// Mock console methods during tests to reduce noise
// But keep errors
const originalConsoleLog = console.log;
const originalConsoleInfo = console.info;
const originalConsoleDebug = console.debug;

beforeAll(() => {
  console.log = jest.fn();
  console.info = jest.fn();
  console.debug = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.info = originalConsoleInfo;
  console.debug = originalConsoleDebug;
});

// Global test utilities
declare global {
  var testUtils: {
    generateTestOrder: (tier?: 'basic' | 'pro' | 'premium') => any;
    mockFetch: (response: any, ok?: boolean) => jest.Mock;
  };
}

global.testUtils = {
  generateTestOrder: (tier: 'basic' | 'pro' | 'premium' = 'basic') => ({
    tier,
    businessName: `Test Business ${Date.now()}`,
    email: `test-${Date.now()}@logogenius.local`,
    archetype: 'The Innovator',
    tagline: 'Building the future today',
    missionStatement: tier !== 'basic' ? 'To create meaningful experiences' : undefined,
  }),
  mockFetch: (response: any, ok: boolean = true) => {
    return jest.fn().mockResolvedValue({
      ok,
      json: jest.fn().mockResolvedValue(response),
      headers: new Map([['content-type', 'application/json']]),
    });
  },
};

// Extend Jest matchers
expect.extend({
  toBeValidOrderId(received: number) {
    const pass = typeof received === 'number' && received > 0;
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be a valid order ID`
          : `expected ${received} to be a valid order ID (number > 0)`,
    };
  },
});
