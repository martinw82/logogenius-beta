import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

function parseConnectionUrl(url) {
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)(\?.*)?/);
  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }
  const [, user, password, host, port, database, queryString] = match;
  const sslMode = queryString?.includes('sslmode=require') ? 'required' : undefined;

  return {
    host,
    port: parseInt(port, 10),
    user,
    password,
    database,
    ssl: sslMode === 'required' ? { rejectUnauthorized: false } : undefined,
  };
}

async function testConnection() {
  console.log('🧪 Testing LogoGenius Database Connection\n');
  console.log('DATABASE_URL:', DATABASE_URL ? 'Set' : 'Not set');

  if (!DATABASE_URL) {
    console.log('❌ DATABASE_URL not set');
    process.exit(1);
  }

  let connection;
  try {
    const config = parseConnectionUrl(DATABASE_URL);
    console.log('\n📡 Connecting to:', config.host);
    
    const pool = mysql.createPool(config);
    connection = await pool.getConnection();
    
    console.log('✅ Connected to database!\n');

    // Test query
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('✅ Test query executed:', result);

    // Check tables
    console.log('\n📋 Checking tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`Found ${tables.length} tables:`);
    tables.forEach(t => {
      const tableName = Object.values(t)[0];
      console.log(`  - ${tableName}`);
    });

    // Check if orders table exists
    const ordersTable = tables.find(t => Object.values(t)[0] === 'orders');
    if (ordersTable) {
      console.log('\n📊 Orders table exists!');
      const [count] = await connection.execute('SELECT COUNT(*) as count FROM orders');
      console.log(`Order count: ${count[0].count}`);
    } else {
      console.log('\n⚠️ Orders table does not exist - needs to be created');
    }

    connection.release();
    await pool.end();
    
    console.log('\n✅ Database test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database test failed:');
    console.error(error.message);
    if (error.message.includes('ER_BAD_DB_ERROR')) {
      console.log('\n💡 Tip: Database does not exist. Create it first.');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Tip: Cannot connect to database server. Check host and port.');
    } else if (error.message.includes('ER_ACCESS_DENIED_ERROR')) {
      console.log('\n💡 Tip: Access denied. Check username and password.');
    }
    process.exit(1);
  }
}

testConnection();
