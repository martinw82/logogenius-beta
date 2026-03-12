import { testConnection, getOrderCount, getBrandArchetypes } from './database';

export async function checkDatabaseHealth() {
  try {
    // Test basic connection
    const connection = await testConnection();
    if (!connection.success) {
      return {
        status: 'error',
        message: connection.error || 'Database connection failed',
        details: {
          connected: false,
        }
      };
    }

    // Get counts
    const [orderCount, archetypes] = await Promise.all([
      getOrderCount(),
      getBrandArchetypes(),
    ]);

    return {
      status: 'ok',
      message: 'Database connected and operational',
      details: {
        connected: true,
        orders: orderCount,
        archetypes: archetypes.length,
      }
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: {
        connected: false,
      }
    };
  }
}
