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

async function setupDatabase() {
  console.log('🏗️  Setting up LogoGenius Database\n');

  if (!DATABASE_URL) {
    console.log('❌ DATABASE_URL not set');
    process.exit(1);
  }

  let connection;
  try {
    const config = parseConnectionUrl(DATABASE_URL);
    console.log('📡 Connecting to:', config.host);
    
    const pool = mysql.createPool(config);
    connection = await pool.getConnection();
    
    console.log('✅ Connected!\n');

    // Create tables
    console.log('📋 Creating tables...\n');

    // Brand Archetypes table
    console.log('1️⃣ Creating brand_archetypes table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS brand_archetypes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT NOT NULL,
        traits TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name)
      )
    `);
    console.log('   ✅ brand_archetypes created\n');

    // Orders table
    console.log('2️⃣ Creating orders table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tier VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        customer_email VARCHAR(255),
        selected_logo_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_tier (tier),
        INDEX idx_customer_email (customer_email)
      )
    `);
    console.log('   ✅ orders created\n');

    // Order Details table
    console.log('3️⃣ Creating order_details table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        field_name VARCHAR(255) NOT NULL,
        field_value LONGTEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        INDEX idx_order_id (order_id),
        INDEX idx_field_name (field_name),
        UNIQUE KEY unique_order_field (order_id, field_name)
      )
    `);
    console.log('   ✅ order_details created\n');

    // Logo Variants table
    console.log('4️⃣ Creating logo_variants table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS logo_variants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        variant_num INT NOT NULL,
        svg_data LONGTEXT NOT NULL,
        svg_path VARCHAR(500),
        selected BOOLEAN DEFAULT FALSE,
        mockup_paths TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        INDEX idx_order_id (order_id),
        INDEX idx_variant_num (variant_num),
        UNIQUE KEY unique_order_variant (order_id, variant_num)
      )
    `);
    console.log('   ✅ logo_variants created\n');

    // Admin Sessions table
    console.log('5️⃣ Creating admin_sessions table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id VARCHAR(255) NOT NULL,
        token VARCHAR(500) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_admin_id (admin_id),
        INDEX idx_token (token)
      )
    `);
    console.log('   ✅ admin_sessions created\n');

    // Seed brand archetypes
    console.log('🌱 Seeding brand archetypes...\n');
    const archetypes = [
      { name: 'The Innovator', description: 'Pioneers who challenge the status quo and create new possibilities. They are visionaries who see what others cannot.', traits: 'Creative, Risk-taking, Visionary, Forward-thinking, Disruptive' },
      { name: 'The Caregiver', description: 'Protects and cares for others. They are driven by compassion and a desire to help those in need.', traits: 'Compassionate, Nurturing, Supportive, Selfless, Empathetic' },
      { name: 'The Hero', description: 'Overcomes challenges and inspires others to do the same. They are courageous and determined.', traits: 'Courageous, Strong, Determined, Confident, Inspirational' },
      { name: 'The Explorer', description: 'Discovers new experiences and pushes boundaries. They crave freedom and authenticity.', traits: 'Adventurous, Curious, Independent, Authentic, Freedom-loving' },
      { name: 'The Creator', description: 'Brings imagination to life through innovation and artistry. They value originality.', traits: 'Artistic, Original, Inventive, Imaginative, Expressive' },
      { name: 'The Ruler', description: 'Creates order and structure. They take control and provide leadership.', traits: 'Authoritative, Responsible, Organized, Commanding, Decisive' },
      { name: 'The Magician', description: 'Makes dreams come true and transforms reality. They bring about change.', traits: 'Transformative, Charismatic, Visionary, Mystical, Powerful' },
      { name: 'The Lover', description: 'Creates intimacy and inspires love. They value relationships and connection.', traits: 'Passionate, Committed, Sensual, Appreciative, Connected' },
      { name: 'The Jester', description: 'Brings joy and humor to the world. They live in the moment and enjoy life.', traits: 'Playful, Humorous, Lighthearted, Fun-loving, Spontaneous' },
      { name: 'The Sage', description: 'Seeks truth and understanding. They value knowledge and wisdom.', traits: 'Wise, Knowledgeable, Analytical, Truthful, Thoughtful' },
      { name: 'The Outlaw', description: 'Challenges the status quo and breaks rules. They fight for change.', traits: 'Rebellious, Disruptive, Free-spirited, Brave, Revolutionary' },
      { name: 'The Innocent', description: 'Seeks happiness and simplicity. They are optimistic and pure.', traits: 'Optimistic, Honest, Pure, Simple, Wholesome' }
    ];

    let seeded = 0;
    for (const archetype of archetypes) {
      try {
        await connection.execute(
          `INSERT INTO brand_archetypes (name, description, traits) 
           VALUES (?, ?, ?) 
           ON DUPLICATE KEY UPDATE 
           description = VALUES(description),
           traits = VALUES(traits)`,
          [archetype.name, archetype.description, archetype.traits]
        );
        seeded++;
      } catch (e) {
        console.log(`   ⚠️  Failed to seed ${archetype.name}: ${e.message}`);
      }
    }
    console.log(`   ✅ Seeded ${seeded} archetypes\n`);

    // Verify setup
    console.log('🔍 Verifying setup...\n');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📊 Total tables: ${tables.length}`);
    tables.forEach(t => {
      const tableName = Object.values(t)[0];
      console.log(`   - ${tableName}`);
    });

    const [archetypeCount] = await connection.execute('SELECT COUNT(*) as count FROM brand_archetypes');
    console.log(`\n📈 Archetypes count: ${archetypeCount[0].count}`);

    connection.release();
    await pool.end();
    
    console.log('\n✅ Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database setup failed:');
    console.error(error.message);
    if (connection) connection.release();
    process.exit(1);
  }
}

setupDatabase();
