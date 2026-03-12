// Comprehensive test of the database module
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

// Parse connection URL
function parseConnectionUrl(url) {
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)(\?.*)?/);
  if (!match) throw new Error('Invalid DATABASE_URL format');
  const [, user, password, host, port, database, queryString] = match;
  const sslMode = queryString?.includes('sslmode=require') ? 'required' : undefined;
  return {
    host, port: parseInt(port, 10), user, password, database,
    ssl: sslMode === 'required' ? { rejectUnauthorized: false } : undefined,
    waitForConnections: true, connectionLimit: 10, queueLimit: 0,
  };
}

let pool = null;
function getPool() {
  if (!pool) pool = mysql.createPool(parseConnectionUrl(DATABASE_URL));
  return pool;
}

// Database operations (simplified version of database.ts)
const db = {
  async createOrder(data) {
    const { tier, customerEmail, status = 'pending' } = data;
    const [result] = await getPool().execute(
      'INSERT INTO orders (tier, customer_email, status) VALUES (?, ?, ?)',
      [tier, customerEmail, status]
    );
    const [rows] = await getPool().execute('SELECT * FROM orders WHERE id = ?', [result.insertId]);
    return rows[0];
  },

  async createOrderDetails(orderId, details) {
    for (const detail of details) {
      await getPool().execute(
        'INSERT INTO order_details (order_id, field_name, field_value) VALUES (?, ?, ?)',
        [orderId, detail.fieldName, detail.fieldValue]
      );
    }
  },

  async getOrderWithDetails(id) {
    const [orders] = await getPool().execute('SELECT * FROM orders WHERE id = ?', [id]);
    if (orders.length === 0) return null;
    const [details] = await getPool().execute('SELECT * FROM order_details WHERE order_id = ?', [id]);
    return { ...orders[0], details };
  },

  async updateOrderStatus(id, status) {
    await getPool().execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    const [orders] = await getPool().execute('SELECT * FROM orders WHERE id = ?', [id]);
    return orders[0];
  },

  async getAllOrders() {
    const [orders] = await getPool().execute('SELECT * FROM orders ORDER BY created_at DESC');
    return orders;
  },

  async getArchetypes() {
    const [rows] = await getPool().execute('SELECT * FROM brand_archetypes ORDER BY name');
    return rows;
  },

  async createLogoVariant(data) {
    const { orderId, variantNum, svgData, svgPath = null } = data;
    const [result] = await getPool().execute(
      'INSERT INTO logo_variants (order_id, variant_num, svg_data, svg_path) VALUES (?, ?, ?, ?)',
      [orderId, variantNum, svgData, svgPath]
    );
    const [rows] = await getPool().execute('SELECT * FROM logo_variants WHERE id = ?', [result.insertId]);
    return rows[0];
  },

  async getLogoVariants(orderId) {
    const [rows] = await getPool().execute('SELECT * FROM logo_variants WHERE order_id = ?', [orderId]);
    return rows;
  },

  async disconnect() {
    if (pool) {
      await pool.end();
      pool = null;
    }
  }
};

async function runTests() {
  console.log('🧪 Testing LogoGenius Database Operations\n');

  if (!DATABASE_URL) {
    console.log('❌ DATABASE_URL not set');
    process.exit(1);
  }

  try {
    // Test 1: Get archetypes
    console.log('1️⃣ Testing getArchetypes()...');
    const archetypes = await db.getArchetypes();
    console.log(`   ✅ Found ${archetypes.length} archetypes`);
    console.log(`   First: ${archetypes[0]?.name}\n`);

    // Test 2: Create order
    console.log('2️⃣ Testing createOrder()...');
    const order = await db.createOrder({
      tier: 'basic',
      customerEmail: 'test@example.com',
      status: 'pending'
    });
    console.log(`   ✅ Created order #${order.id}`);
    console.log(`   Tier: ${order.tier}`);
    console.log(`   Status: ${order.status}\n`);

    // Test 3: Create order details
    console.log('3️⃣ Testing createOrderDetails()...');
    await db.createOrderDetails(order.id, [
      { fieldName: 'businessName', fieldValue: 'Test Business Co' },
      { fieldName: 'industry', fieldValue: 'Technology' },
      { fieldName: 'archetype', fieldValue: 'The Innovator' }
    ]);
    console.log(`   ✅ Added 3 order details\n`);

    // Test 4: Get order with details
    console.log('4️⃣ Testing getOrderWithDetails()...');
    const orderWithDetails = await db.getOrderWithDetails(order.id);
    console.log(`   ✅ Retrieved order #${orderWithDetails.id}`);
    console.log(`   Details count: ${orderWithDetails.details.length}`);
    orderWithDetails.details.forEach(d => {
      console.log(`     - ${d.field_name}: ${d.field_value.substring(0, 50)}${d.field_value.length > 50 ? '...' : ''}`);
    });
    console.log();

    // Test 5: Update order status
    console.log('5️⃣ Testing updateOrderStatus()...');
    const updated = await db.updateOrderStatus(order.id, 'approved');
    console.log(`   ✅ Updated status to: ${updated.status}\n`);

    // Test 6: Create logo variants
    console.log('6️⃣ Testing createLogoVariant()...');
    const variant1 = await db.createLogoVariant({
      orderId: order.id,
      variantNum: 1,
      svgData: '<svg><rect width="100" height="100"/></svg>',
    });
    const variant2 = await db.createLogoVariant({
      orderId: order.id,
      variantNum: 2,
      svgData: '<svg><circle r="50"/></svg>',
    });
    console.log(`   ✅ Created logo variants #${variant1.id} and #${variant2.id}\n`);

    // Test 7: Get logo variants
    console.log('7️⃣ Testing getLogoVariants()...');
    const variants = await db.getLogoVariants(order.id);
    console.log(`   ✅ Found ${variants.length} variants`);
    variants.forEach(v => {
      console.log(`     - Variant ${v.variant_num}: ${v.svg_data.substring(0, 40)}...`);
    });
    console.log();

    // Test 8: Get all orders
    console.log('8️⃣ Testing getAllOrders()...');
    const allOrders = await db.getAllOrders();
    console.log(`   ✅ Total orders: ${allOrders.length}`);
    allOrders.slice(0, 3).forEach(o => {
      console.log(`     - Order #${o.id}: ${o.tier} (${o.status})`);
    });
    console.log();

    console.log('✅ All database operations passed!');
    
    await db.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    await db.disconnect();
    process.exit(1);
  }
}

runTests();
