/**
 * Database adapter for Cloudflare Workers
 * Supports both Cloudflare D1 and external database APIs
 */

/**
 * Database adapter class for Workers
 */
export class WorkersDatabase {
  constructor(env) {
    this.d1 = env.DB || null;
    this.externalApiUrl = env.EXTERNAL_DB_API_URL || null;
    this.apiKey = env.EXTERNAL_DB_API_KEY || null;
  }

  /**
   * Execute query - routes to D1 or external API
   */
  async query(sql, params = []) {
    if (this.d1) {
      return await this.queryD1(sql, params);
    } else if (this.externalApiUrl) {
      return await this.queryExternalApi(sql, params);
    } else {
      throw new Error('No database configuration found');
    }
  }

  /**
   * Execute query against Cloudflare D1
   */
  async queryD1(sql, params = []) {
    try {
      const stmt = this.d1.prepare(sql);
      if (params.length > 0) {
        return await stmt.bind(...params).all();
      }
      return await stmt.all();
    } catch (error) {
      console.error('D1 query error:', error);
      throw error;
    }
  }

  /**
   * Execute query via external API
   */
  async queryExternalApi(sql, params = []) {
    try {
      const response = await fetch(this.externalApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          query: sql,
          params: params
        })
      });

      if (!response.ok) {
        throw new Error(`External API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('External API query error:', error);
      throw error;
    }
  }

  /**
   * Get single record
   */
  async get(sql, params = []) {
    const result = await this.query(sql, params);
    return result.results?.[0] || result[0] || null;
  }

  /**
   * Get all records
   */
  async all(sql, params = []) {
    const result = await this.query(sql, params);
    return result.results || result || [];
  }

  /**
   * Execute statement (INSERT, UPDATE, DELETE)
   */
  async run(sql, params = []) {
    if (this.d1) {
      const stmt = this.d1.prepare(sql);
      if (params.length > 0) {
        return await stmt.bind(...params).run();
      }
      return await stmt.run();
    } else {
      return await this.query(sql, params);
    }
  }

  /**
   * Begin transaction (D1 only)
   */
  async transaction(queries) {
    if (!this.d1) {
      throw new Error('Transactions only supported with D1');
    }

    const statements = queries.map(({ sql, params = [] }) => {
      const stmt = this.d1.prepare(sql);
      return params.length > 0 ? stmt.bind(...params) : stmt;
    });

    return await this.d1.batch(statements);
  }
}

/**
 * User management operations
 */
export class WorkersUserService {
  constructor(db) {
    this.db = db;
  }

  async findByEmail(email) {
    return await this.db.get(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
  }

  async findById(id) {
    return await this.db.get(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
  }

  async create(userData) {
    const result = await this.db.run(
      'INSERT INTO users (email, password, name, role, store_id) VALUES (?, ?, ?, ?, ?)',
      [userData.email, userData.password, userData.name, userData.role, userData.store_id]
    );
    return result;
  }

  async update(id, userData) {
    const result = await this.db.run(
      'UPDATE users SET email = ?, name = ?, role = ?, store_id = ? WHERE id = ?',
      [userData.email, userData.name, userData.role, userData.store_id, id]
    );
    return result;
  }

  async delete(id) {
    return await this.db.run('DELETE FROM users WHERE id = ?', [id]);
  }

  async list(limit = 50, offset = 0) {
    return await this.db.all(
      'SELECT id, email, name, role, store_id, created_at FROM users LIMIT ? OFFSET ?',
      [limit, offset]
    );
  }
}

/**
 * Store management operations
 */
export class WorkersStoreService {
  constructor(db) {
    this.db = db;
  }

  async findById(id) {
    return await this.db.get('SELECT * FROM stores WHERE id = ?', [id]);
  }

  async create(storeData) {
    return await this.db.run(
      'INSERT INTO stores (name, address, phone, manager_id) VALUES (?, ?, ?, ?)',
      [storeData.name, storeData.address, storeData.phone, storeData.manager_id]
    );
  }

  async list() {
    return await this.db.all('SELECT * FROM stores ORDER BY name');
  }

  async update(id, storeData) {
    return await this.db.run(
      'UPDATE stores SET name = ?, address = ?, phone = ?, manager_id = ? WHERE id = ?',
      [storeData.name, storeData.address, storeData.phone, storeData.manager_id, id]
    );
  }

  async delete(id) {
    return await this.db.run('DELETE FROM stores WHERE id = ?', [id]);
  }
}

/**
 * Sales operations
 */
export class WorkersSalesService {
  constructor(db) {
    this.db = db;
  }

  async create(salesData) {
    return await this.db.run(
      `INSERT INTO sales (store_id, user_id, date, total_amount, total_transactions, 
       average_ticket, cash_amount, qris_amount, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        salesData.store_id,
        salesData.user_id,
        salesData.date,
        salesData.total_amount,
        salesData.total_transactions,
        salesData.average_ticket,
        salesData.cash_amount,
        salesData.qris_amount,
        salesData.notes
      ]
    );
  }

  async findByDateRange(store_id, start_date, end_date) {
    return await this.db.all(
      'SELECT * FROM sales WHERE store_id = ? AND date BETWEEN ? AND ? ORDER BY date DESC',
      [store_id, start_date, end_date]
    );
  }

  async findById(id) {
    return await this.db.get('SELECT * FROM sales WHERE id = ?', [id]);
  }

  async update(id, salesData) {
    return await this.db.run(
      `UPDATE sales SET store_id = ?, user_id = ?, date = ?, total_amount = ?, 
       total_transactions = ?, average_ticket = ?, cash_amount = ?, qris_amount = ?, 
       notes = ? WHERE id = ?`,
      [
        salesData.store_id,
        salesData.user_id,
        salesData.date,
        salesData.total_amount,
        salesData.total_transactions,
        salesData.average_ticket,
        salesData.cash_amount,
        salesData.qris_amount,
        salesData.notes,
        id
      ]
    );
  }

  async delete(id) {
    return await this.db.run('DELETE FROM sales WHERE id = ?', [id]);
  }
}

/**
 * Attendance operations
 */
export class WorkersAttendanceService {
  constructor(db) {
    this.db = db;
  }

  async create(attendanceData) {
    return await this.db.run(
      'INSERT INTO attendance (user_id, store_id, date, check_in, check_out, total_hours, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        attendanceData.user_id,
        attendanceData.store_id,
        attendanceData.date,
        attendanceData.check_in,
        attendanceData.check_out,
        attendanceData.total_hours,
        attendanceData.notes
      ]
    );
  }

  async findByUserAndDate(user_id, date) {
    return await this.db.get(
      'SELECT * FROM attendance WHERE user_id = ? AND date = ?',
      [user_id, date]
    );
  }

  async findByDateRange(user_id, start_date, end_date) {
    return await this.db.all(
      'SELECT * FROM attendance WHERE user_id = ? AND date BETWEEN ? AND ? ORDER BY date DESC',
      [user_id, start_date, end_date]
    );
  }

  async update(id, attendanceData) {
    return await this.db.run(
      'UPDATE attendance SET check_in = ?, check_out = ?, total_hours = ?, notes = ? WHERE id = ?',
      [attendanceData.check_in, attendanceData.check_out, attendanceData.total_hours, attendanceData.notes, id]
    );
  }
}

/**
 * Session management for Workers (using KV)
 */
export class WorkersSessionService {
  constructor(kv) {
    this.kv = kv;
    this.sessionTimeout = 24 * 60 * 60; // 24 hours in seconds
  }

  async create(userId, userData) {
    if (!this.kv) {
      throw new Error('KV storage not configured');
    }

    const sessionId = crypto.randomUUID();
    const sessionData = {
      userId,
      userData,
      createdAt: Date.now(),
      expiresAt: Date.now() + (this.sessionTimeout * 1000)
    };

    await this.kv.put(`session:${sessionId}`, JSON.stringify(sessionData), {
      expirationTtl: this.sessionTimeout
    });

    return sessionId;
  }

  async get(sessionId) {
    if (!this.kv) {
      return null;
    }

    const sessionData = await this.kv.get(`session:${sessionId}`);
    if (!sessionData) {
      return null;
    }

    const parsed = JSON.parse(sessionData);
    if (parsed.expiresAt < Date.now()) {
      await this.delete(sessionId);
      return null;
    }

    return parsed;
  }

  async delete(sessionId) {
    if (!this.kv) {
      return;
    }
    await this.kv.delete(`session:${sessionId}`);
  }

  async extend(sessionId) {
    const session = await this.get(sessionId);
    if (!session) {
      return false;
    }

    session.expiresAt = Date.now() + (this.sessionTimeout * 1000);
    await this.kv.put(`session:${sessionId}`, JSON.stringify(session), {
      expirationTtl: this.sessionTimeout
    });

    return true;
  }
}