import mysql from 'mysql2/promise';

// Database configuration from environment
const getDbConfig = () => ({
  uri: process.env.DATABASE_URL,
});

// Parse connection URL
function parseConnectionUrl(url: string): mysql.PoolOptions {
  // Handle mysql://username:password@host:port/database?sslmode=required
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
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
}

// Create connection pool
let pool: mysql.Pool | null = null;

function getPool(): mysql.Pool {
  if (!pool) {
    const config = getDbConfig();
    if (!config.uri) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    pool = mysql.createPool(parseConnectionUrl(config.uri));
  }
  return pool;
}

// Type definitions
export interface Order {
  id: number;
  tier: string;
  status: string;
  customerEmail: string | null;
  selectedLogoId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderDetail {
  id: number;
  orderId: number;
  fieldName: string;
  fieldValue: string;
  createdAt: Date;
}

export interface BrandArchetype {
  id: number;
  name: string;
  description: string;
  traits: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LogoVariant {
  id: number;
  orderId: number;
  variantNum: number;
  svgData: string;
  svgPath: string | null;
  selected: boolean;
  mockupPaths: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminSession {
  id: number;
  adminId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// Helper to convert snake_case to camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result;
}

// Prisma-style API for backward compatibility with existing code
export const prisma = {
  order: {
    async count(): Promise<number> {
      const [result] = await getPool().execute('SELECT COUNT(*) as count FROM orders');
      return (result as any[])[0].count;
    },

    async findMany(options?: { 
      where?: { status?: string; tier?: string };
      orderBy?: { createdAt?: 'asc' | 'desc' };
    }): Promise<Order[]> {
      let query = 'SELECT * FROM orders';
      const params: any[] = [];

      if (options?.where) {
        const conditions: string[] = [];
        if (options.where.status) {
          conditions.push('status = ?');
          params.push(options.where.status);
        }
        if (options.where.tier) {
          conditions.push('tier = ?');
          params.push(options.where.tier);
        }
        if (conditions.length > 0) {
          query += ' WHERE ' + conditions.join(' AND ');
        }
      }

      if (options?.orderBy?.createdAt) {
        query += ` ORDER BY created_at ${options.orderBy.createdAt.toUpperCase()}`;
      } else {
        query += ' ORDER BY created_at DESC';
      }

      const [rows] = await getPool().execute(query, params);
      return toCamelCase(rows);
    },

    async findUnique(options: { where: { id: number } }): Promise<Order | null> {
      const [rows] = await getPool().execute(
        'SELECT * FROM orders WHERE id = ?',
        [options.where.id]
      );
      const results = toCamelCase(rows) as Order[];
      return results.length > 0 ? results[0] : null;
    },

    async create(options: { 
      data: { 
        tier: string; 
        status?: string; 
        customerEmail?: string;
        selectedLogoId?: number;
      } 
    }): Promise<Order> {
      const { tier, status = 'pending', customerEmail = null, selectedLogoId = null } = options.data;
      const [result] = await getPool().execute(
        'INSERT INTO orders (tier, status, customer_email, selected_logo_id) VALUES (?, ?, ?, ?)',
        [tier, status, customerEmail, selectedLogoId]
      );
      const insertId = (result as any).insertId;
      const order = await this.findUnique({ where: { id: insertId } });
      if (!order) throw new Error('Failed to create order');
      return order;
    },

    async update(options: { 
      where: { id: number }; 
      data: Partial<Order>;
    }): Promise<Order> {
      const updates: string[] = [];
      const params: any[] = [];

      if (options.data.status !== undefined) {
        updates.push('status = ?');
        params.push(options.data.status);
      }
      if (options.data.customerEmail !== undefined) {
        updates.push('customer_email = ?');
        params.push(options.data.customerEmail);
      }
      if (options.data.selectedLogoId !== undefined) {
        updates.push('selected_logo_id = ?');
        params.push(options.data.selectedLogoId);
      }

      if (updates.length === 0) {
        const order = await this.findUnique({ where: { id: options.where.id } });
        if (!order) throw new Error('Order not found');
        return order;
      }

      params.push(options.where.id);
      await getPool().execute(
        `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      const order = await this.findUnique({ where: { id: options.where.id } });
      if (!order) throw new Error('Order not found');
      return order;
    },
  },

  orderDetail: {
    async findMany(options?: { where?: { orderId?: number } }): Promise<OrderDetail[]> {
      let query = 'SELECT * FROM order_details';
      const params: any[] = [];

      if (options?.where?.orderId) {
        query += ' WHERE order_id = ?';
        params.push(options.where.orderId);
      }

      const [rows] = await getPool().execute(query, params);
      return toCamelCase(rows);
    },

    async findUnique(options: { where: { orderId: number; fieldName: string } }): Promise<OrderDetail | null> {
      return this.findFirst({
        where: {
          orderId: options.where.orderId,
          fieldName: options.where.fieldName,
        },
      });
    },

    async findFirst(options?: { where?: { orderId?: number; fieldName?: string } }): Promise<OrderDetail | null> {
      let query = 'SELECT * FROM order_details';
      const conditions: string[] = [];
      const params: any[] = [];

      if (options?.where?.orderId) {
        conditions.push('order_id = ?');
        params.push(options.where.orderId);
      }
      if (options?.where?.fieldName) {
        conditions.push('field_name = ?');
        params.push(options.where.fieldName);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      query += ' LIMIT 1';

      const [rows] = await getPool().execute(query, params);
      const results = toCamelCase(rows) as OrderDetail[];
      return results.length > 0 ? results[0] : null;
    },

    async createMany(options: { data: Array<{ orderId: number; fieldName: string; fieldValue: string }> }): Promise<void> {
      const values = options.data.map(() => '(?, ?, ?)').join(', ');
      const params = options.data.flatMap(d => [d.orderId, d.fieldName, d.fieldValue]);
      await getPool().execute(
        `INSERT INTO order_details (order_id, field_name, field_value) VALUES ${values}`,
        params
      );
    },

    async upsert(options: {
      where: { orderId_fieldName: { orderId: number; fieldName: string } };
      create: { orderId: number; fieldName: string; fieldValue: string };
      update: { fieldValue: string };
    }): Promise<void> {
      const existing = await this.findFirst({
        where: {
          orderId: options.where.orderId_fieldName.orderId,
          fieldName: options.where.orderId_fieldName.fieldName,
        },
      });

      if (existing) {
        await getPool().execute(
          'UPDATE order_details SET field_value = ? WHERE order_id = ? AND field_name = ?',
          [options.update.fieldValue, options.where.orderId_fieldName.orderId, options.where.orderId_fieldName.fieldName]
        );
      } else {
        await getPool().execute(
          'INSERT INTO order_details (order_id, field_name, field_value) VALUES (?, ?, ?)',
          [options.create.orderId, options.create.fieldName, options.create.fieldValue]
        );
      }
    },

    async deleteMany(options?: { where?: { orderId?: number } }): Promise<void> {
      let query = 'DELETE FROM order_details';
      const params: any[] = [];

      if (options?.where?.orderId) {
        query += ' WHERE order_id = ?';
        params.push(options.where.orderId);
      }

      await getPool().execute(query, params);
    },
  },

  logoVariant: {
    async findMany(options?: { where?: { orderId?: number } }): Promise<LogoVariant[]> {
      let query = 'SELECT * FROM logo_variants';
      const params: any[] = [];

      if (options?.where?.orderId) {
        query += ' WHERE order_id = ?';
        params.push(options.where.orderId);
      }

      const [rows] = await getPool().execute(query, params);
      return toCamelCase(rows);
    },

    async findFirst(options: { where: { orderId: number; variantNum: number } }): Promise<LogoVariant | null> {
      const [rows] = await getPool().execute(
        'SELECT * FROM logo_variants WHERE order_id = ? AND variant_num = ?',
        [options.where.orderId, options.where.variantNum]
      );
      const results = toCamelCase(rows) as LogoVariant[];
      return results.length > 0 ? results[0] : null;
    },

    async update(options: {
      where: { id: number };
      data: Partial<LogoVariant>;
    }): Promise<LogoVariant> {
      const updates: string[] = [];
      const params: any[] = [];

      if (options.data.svgData !== undefined) {
        updates.push('svg_data = ?');
        params.push(options.data.svgData);
      }
      if (options.data.svgPath !== undefined) {
        updates.push('svg_path = ?');
        params.push(options.data.svgPath);
      }
      if (options.data.selected !== undefined) {
        updates.push('selected = ?');
        params.push(options.data.selected);
      }
      if (options.data.mockupPaths !== undefined) {
        updates.push('mockup_paths = ?');
        params.push(options.data.mockupPaths);
      }

      params.push(options.where.id);
      await getPool().execute(
        `UPDATE logo_variants SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
      
      const [rows] = await getPool().execute(
        'SELECT * FROM logo_variants WHERE id = ?',
        [options.where.id]
      );
      return toCamelCase((rows as any[])[0]);
    },

    async updateMany(options: {
      where: { orderId: number; variantNum: number };
      data: Partial<LogoVariant>;
    }): Promise<void> {
      const updates: string[] = [];
      const params: any[] = [];

      if (options.data.svgData !== undefined) {
        updates.push('svg_data = ?');
        params.push(options.data.svgData);
      }
      if (options.data.svgPath !== undefined) {
        updates.push('svg_path = ?');
        params.push(options.data.svgPath);
      }
      if (options.data.selected !== undefined) {
        updates.push('selected = ?');
        params.push(options.data.selected);
      }
      if (options.data.mockupPaths !== undefined) {
        updates.push('mockup_paths = ?');
        params.push(options.data.mockupPaths);
      }

      if (updates.length === 0) return;

      params.push(options.where.orderId, options.where.variantNum);
      await getPool().execute(
        `UPDATE logo_variants SET ${updates.join(', ')} WHERE order_id = ? AND variant_num = ?`,
        params
      );
    },

    async create(options: {
      data: {
        orderId: number;
        variantNum: number;
        svgData: string;
        svgPath?: string;
      };
    }): Promise<LogoVariant> {
      const { orderId, variantNum, svgData, svgPath = null } = options.data;
      const [result] = await getPool().execute(
        'INSERT INTO logo_variants (order_id, variant_num, svg_data, svg_path) VALUES (?, ?, ?, ?)',
        [orderId, variantNum, svgData, svgPath]
      );
      const [rows] = await getPool().execute(
        'SELECT * FROM logo_variants WHERE id = ?',
        [(result as any).insertId]
      );
      return toCamelCase((rows as any[])[0]);
    },
  },

  adminSession: {
    async create(options: { data: { adminId: string; token: string; expiresAt: Date } }): Promise<AdminSession> {
      const { adminId, token, expiresAt } = options.data;
      const [result] = await getPool().execute(
        'INSERT INTO admin_sessions (admin_id, token, expires_at) VALUES (?, ?, ?)',
        [adminId, token, expiresAt]
      );
      const [rows] = await getPool().execute(
        'SELECT * FROM admin_sessions WHERE id = ?',
        [(result as any).insertId]
      );
      return toCamelCase((rows as any[])[0]);
    },

    async findUnique(options: { where: { token: string } }): Promise<AdminSession | null> {
      const [rows] = await getPool().execute(
        'SELECT * FROM admin_sessions WHERE token = ?',
        [options.where.token]
      );
      const results = toCamelCase(rows) as AdminSession[];
      return results.length > 0 ? results[0] : null;
    },

    async delete(options: { where: { token: string } }): Promise<void> {
      await getPool().execute(
        'DELETE FROM admin_sessions WHERE token = ?',
        [options.where.token]
      );
    },
  },

  brandArchetype: {
    async findMany(): Promise<BrandArchetype[]> {
      const [rows] = await getPool().execute('SELECT * FROM brand_archetypes ORDER BY name ASC');
      return toCamelCase(rows);
    },

    async findUnique(options: { where: { name: string } }): Promise<BrandArchetype | null> {
      const [rows] = await getPool().execute(
        'SELECT * FROM brand_archetypes WHERE name = ?',
        [options.where.name]
      );
      const results = toCamelCase(rows) as BrandArchetype[];
      return results.length > 0 ? results[0] : null;
    },

    async upsert(options: {
      where: { name: string };
      create: { name: string; description: string; traits: string };
      update: { description?: string; traits?: string };
    }): Promise<BrandArchetype> {
      const existing = await this.findUnique({ where: { name: options.where.name } });
      
      if (existing) {
        const updates: string[] = [];
        const params: any[] = [];
        
        if (options.update.description !== undefined) {
          updates.push('description = ?');
          params.push(options.update.description);
        }
        if (options.update.traits !== undefined) {
          updates.push('traits = ?');
          params.push(options.update.traits);
        }
        
        if (updates.length > 0) {
          params.push(existing.id);
          await getPool().execute(
            `UPDATE brand_archetypes SET ${updates.join(', ')} WHERE id = ?`,
            params
          );
        }
        
        return this.findUnique({ where: { name: options.where.name } }) as Promise<BrandArchetype>;
      } else {
        const [result] = await getPool().execute(
          'INSERT INTO brand_archetypes (name, description, traits) VALUES (?, ?, ?)',
          [options.create.name, options.create.description, options.create.traits]
        );
        const [rows] = await getPool().execute(
          'SELECT * FROM brand_archetypes WHERE id = ?',
          [(result as any).insertId]
        );
        return toCamelCase((rows as any[])[0]);
      }
    },
  },

  $disconnect: async (): Promise<void> => {
    if (pool) {
      await pool.end();
      pool = null;
    }
  },
};

// Export getPrisma for compatibility
export function getPrisma() {
  return prisma;
}

// Test connection helper
export async function testConnection(): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const connection = await getPool().getConnection();
    await connection.ping();
    connection.release();
    return { success: true, message: 'Database connected successfully' };
  } catch (error) {
    return {
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Additional helper functions
export async function getOrderCount(): Promise<number> {
  return prisma.order.count();
}

export async function getAllOrders(): Promise<Order[]> {
  return prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getOrderById(id: number): Promise<(Order & { details: OrderDetail[]; logoVariants: LogoVariant[] }) | null> {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return null;
  
  const details = await prisma.orderDetail.findMany({ where: { orderId: id } });
  const logoVariants = await prisma.logoVariant.findMany({ where: { orderId: id } });
  
  return { ...order, details, logoVariants };
}

export async function createOrder(data: {
  tier: string;
  customerEmail?: string;
  status?: string;
  details?: Array<{ fieldName: string; fieldValue: string }>;
}): Promise<Order & { details: OrderDetail[] }> {
  const order = await prisma.order.create({
    data: {
      tier: data.tier,
      customerEmail: data.customerEmail,
      status: data.status || 'pending',
    },
  });

  if (data.details && data.details.length > 0) {
    await prisma.orderDetail.createMany({
      data: data.details.map(d => ({
        orderId: order.id,
        fieldName: d.fieldName,
        fieldValue: d.fieldValue,
      })),
    });
  }

  const details = await prisma.orderDetail.findMany({ where: { orderId: order.id } });
  return { ...order, details };
}

export async function updateOrder(
  id: number,
  data: {
    status?: string;
    selectedLogoId?: number | null;
    customerEmail?: string;
  }
): Promise<Order> {
  return prisma.order.update({
    where: { id },
    data,
  });
}

export async function createLogoVariant(data: {
  orderId: number;
  variantNum: number;
  svgData: string;
  svgPath?: string;
}): Promise<LogoVariant> {
  return prisma.logoVariant.create({ data });
}

export async function getBrandArchetypes(): Promise<BrandArchetype[]> {
  return prisma.brandArchetype.findMany();
}

export async function getArchetypeByName(name: string): Promise<BrandArchetype | null> {
  return prisma.brandArchetype.findUnique({ where: { name } });
}

export async function seedArchetypes(
  archetypes: Array<{ name: string; description: string; traits: string }>
): Promise<BrandArchetype[]> {
  const results: BrandArchetype[] = [];
  for (const archetype of archetypes) {
    const result = await prisma.brandArchetype.upsert({
      where: { name: archetype.name },
      update: archetype,
      create: archetype,
    });
    results.push(result);
  }
  return results;
}
