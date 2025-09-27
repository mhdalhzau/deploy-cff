/**
 * MySQL to D1 Data Export Script
 * Exports data from MySQL and converts to D1-compatible format
 */

import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get database connection from environment
const DATABASE_URL = process.env.MYSQL_DATABASE_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found. Please set MYSQL_DATABASE_URL or DATABASE_URL');
  process.exit(1);
}

// Parse MySQL connection URL
function parseMySQLUrl(url) {
  const urlObj = new URL(url);
  return {
    host: urlObj.hostname,
    port: urlObj.port || 3306,
    user: urlObj.username,
    password: urlObj.password,
    database: urlObj.pathname.slice(1),
    ssl: urlObj.searchParams.get('ssl') ? { rejectUnauthorized: false } : false
  };
}

// Generate UUID v4 (for D1 compatibility)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Convert MySQL timestamp to SQLite datetime
function convertTimestamp(mysqlTimestamp) {
  if (!mysqlTimestamp) return null;
  return new Date(mysqlTimestamp).toISOString();
}

// Escape SQL values for SQLite
function escapeSQLiteValue(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (typeof value === 'string') {
    return "'" + value.replace(/'/g, "''") + "'";
  }
  return "'" + String(value).replace(/'/g, "''") + "'";
}

// Table definitions with column mappings
const TABLES = [
  {
    name: 'stores',
    idColumn: 'store_id',
    columns: ['store_id', 'name', 'address', 'phone', 'manager', 'description', 'status', 
              'entry_time_start', 'entry_time_end', 'exit_time_start', 'exit_time_end', 
              'timezone', 'created_at']
  },
  {
    name: 'users',
    idColumn: 'user_id',
    columns: ['user_id', 'email', 'password', 'name', 'role', 'phone', 'salary', 'created_at']
  },
  {
    name: 'user_stores',
    idColumn: 'user_store_id',
    columns: ['user_store_id', 'user_id', 'store_id', 'created_at']
  },
  {
    name: 'attendance',
    idColumn: 'attendance_id',
    columns: ['attendance_id', 'user_id', 'store_id', 'date', 'check_in', 'check_out', 
              'shift', 'lateness_minutes', 'overtime_minutes', 'break_duration', 'overtime', 
              'notes', 'attendance_status', 'status', 'created_at']
  },
  {
    name: 'sales',
    idColumn: 'sales_id',
    columns: ['sales_id', 'store_id', 'user_id', 'date', 'total_sales', 'transactions', 
              'average_ticket', 'total_qris', 'total_cash', 'meter_start', 'meter_end', 
              'total_liters', 'total_income', 'total_expenses', 'income_details', 
              'expense_details', 'shift', 'check_in', 'check_out', 'submission_date', 'created_at']
  },
  {
    name: 'cashflow',
    idColumn: 'cashflow_id',
    columns: ['cashflow_id', 'store_id', 'category', 'type', 'amount', 'description', 
              'customer_id', 'piutang_id', 'payment_status', 'jumlah_galon', 'pajak_ongkos', 
              'pajak_transfer', 'total_pengeluaran', 'konter', 'pajak_transfer_rekening', 
              'hasil', 'date', 'created_at']
  },
  {
    name: 'payroll',
    idColumn: 'payroll_id',
    columns: ['payroll_id', 'user_id', 'store_id', 'month', 'base_salary', 'overtime_pay', 
              'bonuses', 'deductions', 'total_amount', 'status', 'paid_at', 'created_at']
  },
  {
    name: 'proposals',
    idColumn: 'proposal_id',
    columns: ['proposal_id', 'user_id', 'store_id', 'title', 'category', 'estimated_cost', 
              'description', 'status', 'reviewed_by', 'reviewed_at', 'created_at']
  },
  {
    name: 'overtime',
    idColumn: 'overtime_id',
    columns: ['overtime_id', 'user_id', 'store_id', 'date', 'hours', 'reason', 'status', 
              'approved_by', 'approved_at', 'created_at']
  },
  {
    name: 'setoran',
    idColumn: 'setoran_id',
    columns: ['setoran_id', 'employee_name', 'employee_id', 'jam_masuk', 'jam_keluar', 
              'nomor_awal', 'nomor_akhir', 'total_liter', 'total_setoran', 'qris_setoran', 
              'cash_setoran', 'expenses_data', 'total_expenses', 'income_data', 'total_income', 
              'total_keseluruhan', 'created_at']
  },
  {
    name: 'customers',
    idColumn: 'customer_id',
    columns: ['customer_id', 'name', 'email', 'phone', 'address', 'type', 'store_id', 'created_at']
  },
  {
    name: 'piutang',
    idColumn: 'piutang_id',
    columns: ['piutang_id', 'customer_id', 'store_id', 'amount', 'description', 'due_date', 
              'status', 'paid_amount', 'paid_at', 'created_by', 'created_at']
  },
  {
    name: 'suppliers',
    idColumn: 'supplier_id',
    columns: ['supplier_id', 'name', 'contact_person', 'phone', 'email', 'address', 
              'description', 'status', 'store_id', 'created_at']
  },
  {
    name: 'products',
    idColumn: 'product_id',
    columns: ['product_id', 'name', 'description', 'sku', 'category', 'unit', 'buying_price', 
              'selling_price', 'supplier_id', 'status', 'store_id', 'created_at']
  },
  {
    name: 'inventory',
    idColumn: 'inventory_id',
    columns: ['inventory_id', 'product_id', 'store_id', 'current_stock', 'minimum_stock', 
              'maximum_stock', 'last_updated', 'created_at']
  },
  {
    name: 'inventory_transactions',
    idColumn: 'inventory_transaction_id',
    columns: ['inventory_transaction_id', 'product_id', 'store_id', 'type', 'quantity', 
              'reference_type', 'reference_id', 'notes', 'user_id', 'created_at']
  },
  {
    name: 'wallets',
    idColumn: 'wallet_id',
    columns: ['wallet_id', 'store_id', 'name', 'type', 'balance', 'account_number', 
              'description', 'is_active', 'created_at', 'updated_at']
  },
  {
    name: 'payroll_config',
    idColumn: 'payroll_config_id',
    columns: ['payroll_config_id', 'payroll_cycle', 'overtime_rate', 'start_date', 
              'next_payroll_date', 'is_active', 'created_at', 'updated_at']
  }
];

async function exportData() {
  console.log('🚀 Starting MySQL to D1 data export...');
  
  let connection;
  
  try {
    // Connect to MySQL
    const config = parseMySQLUrl(DATABASE_URL);
    console.log(`📡 Connecting to MySQL at ${config.host}:${config.port}/${config.database}`);
    
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to MySQL database');
    
    let totalRecords = 0;
    const sqlStatements = ['-- D1 Data Import SQL\n-- Generated from MySQL export\n'];
    
    // Process each table
    for (const table of TABLES) {
      console.log(`\n📋 Processing table: ${table.name}`);
      
      try {
        // Check if table exists
        const [tableCheck] = await connection.execute(
          `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?`,
          [config.database, table.name]
        );
        
        if (tableCheck[0].count === 0) {
          console.log(`⚠️  Table ${table.name} not found, skipping...`);
          continue;
        }
        
        // Get data from MySQL
        const [rows] = await connection.execute(`SELECT * FROM \`${table.name}\``);
        
        if (rows.length === 0) {
          console.log(`📭 Table ${table.name} is empty, skipping...`);
          continue;
        }
        
        console.log(`📦 Found ${rows.length} records in ${table.name}`);
        totalRecords += rows.length;
        
        // Generate INSERT statements
        sqlStatements.push(`\n-- Table: ${table.name}`);
        sqlStatements.push(`DELETE FROM ${table.name};`);
        
        for (const row of rows) {
          const values = table.columns.map(col => {
            let value = row[col];
            
            // Convert timestamps
            if (col.includes('_at') || col === 'date' || col === 'due_date') {
              value = convertTimestamp(value);
            }
            
            // Convert boolean for SQLite
            if (col === 'is_active' && typeof value === 'boolean') {
              value = value ? 1 : 0;
            }
            
            return escapeSQLiteValue(value);
          });
          
          const insertSql = `INSERT INTO ${table.name} (${table.columns.join(', ')}) VALUES (${values.join(', ')});`;
          sqlStatements.push(insertSql);
        }
        
        console.log(`✅ Exported ${rows.length} records from ${table.name}`);
        
      } catch (error) {
        console.error(`❌ Error processing table ${table.name}:`, error.message);
        continue;
      }
    }
    
    // Write to file
    const outputFile = path.join(__dirname, 'data-import.sql');
    fs.writeFileSync(outputFile, sqlStatements.join('\n'));
    
    console.log(`\n🎉 Export completed successfully!`);
    console.log(`📊 Total records exported: ${totalRecords}`);
    console.log(`📁 SQL file created: ${outputFile}`);
    console.log(`\n📝 Next steps:`);
    console.log(`1. wrangler d1 execute your-db-name --file=${outputFile}`);
    console.log(`2. Test your D1 database`);
    console.log(`3. Update application configuration`);
    
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 MySQL connection closed');
    }
  }
}

// Run export
exportData().catch(console.error);