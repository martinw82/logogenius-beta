// Test database connection
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load database module
const db = require('../src/lib/database.ts');
const { testConnection, prisma, getOrderCount, seedArchetypes } = db;

async function runTests() {
  console.log('🧪 Testing LogoGenius Database Connection\n');
  
  // Test 1: Connection
  console.log('1️⃣ Testing database connection...');
  const connResult = await testConnection();
  if (connResult.success) {
    console.log('✅ Database connected successfully!\n');
  } else {
    console.log('❌ Database connection failed:', connResult.error);
    process.exit(1);
  }

  // Test 2: Get counts
  console.log('2️⃣ Getting table counts...');
  try {
    const orderCount = await getOrderCount();
    console.log(`   Orders: ${orderCount}`);
    
    const archetypes = await prisma.brandArchetype.findMany();
    console.log(`   Archetypes: ${archetypes.length}\n`);
  } catch (error) {
    console.log('❌ Error getting counts:', error.message);
    console.log('   Note: This is OK if tables don\'t exist yet\n');
  }

  // Test 3: Seed archetypes if empty
  console.log('3️⃣ Checking archetypes...');
  const existingArchetypes = await prisma.brandArchetype.findMany();
  if (existingArchetypes.length === 0) {
    console.log('   No archetypes found. Seeding default archetypes...');
    const defaultArchetypes = [
      { name: 'The Innovator', description: 'Pioneers who challenge the status quo', traits: 'Creative, Risk-taking, Visionary' },
      { name: 'The Caregiver', description: 'Protects and cares for others', traits: 'Compassionate, Nurturing, Supportive' },
      { name: 'The Hero', description: 'Overcomes challenges and inspires', traits: 'Courageous, Strong, Determined' },
      { name: 'The Explorer', description: 'Discovers new experiences', traits: 'Adventurous, Curious, Independent' },
      { name: 'The Creator', description: 'Brings imagination to life', traits: 'Artistic, Original, Inventive' },
    ];
    await seedArchetypes(defaultArchetypes);
    console.log('   ✅ Seeded 5 archetypes\n');
  } else {
    console.log(`   ✅ ${existingArchetypes.length} archetypes already exist\n`);
  }

  // Test 4: Create a test order
  console.log('4️⃣ Creating test order...');
  try {
    const order = await prisma.order.create({
      data: {
        tier: 'basic',
        customerEmail: 'test@example.com',
        status: 'pending',
      },
    });
    console.log(`   ✅ Created order #${order.id}`);
    console.log(`   Tier: ${order.tier}`);
    console.log(`   Status: ${order.status}\n`);

    // Test 5: Add order details
    console.log('5️⃣ Adding order details...');
    await prisma.orderDetail.createMany({
      data: [
        { orderId: order.id, fieldName: 'businessName', fieldValue: 'Test Business' },
        { orderId: order.id, fieldName: 'industry', fieldValue: 'Technology' },
      ],
    });
    console.log('   ✅ Added 2 order details\n');

    // Test 6: Fetch order with details
    console.log('6️⃣ Fetching order with details...');
    const fetchedOrder = await prisma.order.findUnique({ where: { id: order.id } });
    const details = await prisma.orderDetail.findMany({ where: { orderId: order.id } });
    console.log(`   ✅ Found order #${fetchedOrder?.id}`);
    console.log(`   Details count: ${details.length}\n`);

    // Test 7: Update order
    console.log('7️⃣ Updating order status...');
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'approved' },
    });
    console.log(`   ✅ Updated status to: ${updated.status}\n`);

    console.log('✅ All database tests passed!');
  } catch (error) {
    console.log('❌ Error:', error.message);
    console.log('   Note: Tables may not exist. Run schema creation first.\n');
  }

  await prisma.$disconnect();
}

runTests().catch(console.error);
