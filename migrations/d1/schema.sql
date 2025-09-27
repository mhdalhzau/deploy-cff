-- Cloudflare D1 Database Schema
-- Migrated from MySQL to SQLite for Cloudflare Workers
-- Generated: 2025-09-27

-- Create tables with SQLite-compatible syntax

-- Users table
CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  salary REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User-Store assignment table
CREATE TABLE IF NOT EXISTS user_stores (
  user_store_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  store_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (store_id) REFERENCES stores(store_id)
);

-- Stores table
CREATE TABLE IF NOT EXISTS stores (
  store_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  manager TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  entry_time_start TEXT DEFAULT '07:00',
  entry_time_end TEXT DEFAULT '09:00',
  exit_time_start TEXT DEFAULT '17:00',
  exit_time_end TEXT DEFAULT '19:00',
  timezone TEXT DEFAULT 'Asia/Jakarta',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  attendance_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  store_id INTEGER NOT NULL,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  check_in TEXT,
  check_out TEXT,
  shift TEXT,
  lateness_minutes INTEGER DEFAULT 0,
  overtime_minutes INTEGER DEFAULT 0,
  break_duration INTEGER DEFAULT 0,
  overtime REAL DEFAULT 0,
  notes TEXT,
  attendance_status TEXT DEFAULT 'belum_diatur',
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (store_id) REFERENCES stores(store_id)
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  sales_id TEXT PRIMARY KEY,
  store_id INTEGER NOT NULL,
  user_id TEXT,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_sales REAL NOT NULL,
  transactions INTEGER NOT NULL,
  average_ticket REAL,
  total_qris REAL DEFAULT 0,
  total_cash REAL DEFAULT 0,
  meter_start REAL,
  meter_end REAL,
  total_liters REAL,
  total_income REAL DEFAULT 0,
  total_expenses REAL DEFAULT 0,
  income_details TEXT,
  expense_details TEXT,
  shift TEXT,
  check_in TEXT,
  check_out TEXT,
  submission_date TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (store_id) REFERENCES stores(store_id)
);

-- Cashflow table
CREATE TABLE IF NOT EXISTS cashflow (
  cashflow_id TEXT PRIMARY KEY,
  store_id INTEGER NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT,
  customer_id TEXT,
  piutang_id TEXT,
  payment_status TEXT DEFAULT 'lunas',
  jumlah_galon REAL,
  pajak_ongkos REAL,
  pajak_transfer REAL DEFAULT 2500,
  total_pengeluaran REAL,
  konter TEXT,
  pajak_transfer_rekening REAL,
  hasil REAL,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(store_id),
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
  FOREIGN KEY (piutang_id) REFERENCES piutang(piutang_id)
);

-- Payroll table
CREATE TABLE IF NOT EXISTS payroll (
  payroll_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  store_id INTEGER NOT NULL,
  month TEXT NOT NULL,
  base_salary REAL NOT NULL,
  overtime_pay REAL DEFAULT 0,
  bonuses TEXT,
  deductions TEXT,
  total_amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (store_id) REFERENCES stores(store_id)
);

-- Proposals table
CREATE TABLE IF NOT EXISTS proposals (
  proposal_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  store_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  estimated_cost REAL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  reviewed_by TEXT,
  reviewed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (store_id) REFERENCES stores(store_id),
  FOREIGN KEY (reviewed_by) REFERENCES users(user_id)
);

-- Overtime table
CREATE TABLE IF NOT EXISTS overtime (
  overtime_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  store_id INTEGER NOT NULL,
  date DATETIME NOT NULL,
  hours REAL NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  approved_by TEXT,
  approved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (store_id) REFERENCES stores(store_id),
  FOREIGN KEY (approved_by) REFERENCES users(user_id)
);

-- Setoran table
CREATE TABLE IF NOT EXISTS setoran (
  setoran_id TEXT PRIMARY KEY,
  employee_name TEXT NOT NULL,
  employee_id TEXT,
  jam_masuk TEXT NOT NULL,
  jam_keluar TEXT NOT NULL,
  nomor_awal REAL NOT NULL,
  nomor_akhir REAL NOT NULL,
  total_liter REAL NOT NULL,
  total_setoran REAL NOT NULL,
  qris_setoran REAL NOT NULL,
  cash_setoran REAL NOT NULL,
  expenses_data TEXT,
  total_expenses REAL NOT NULL,
  income_data TEXT,
  total_income REAL NOT NULL,
  total_keseluruhan REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(user_id)
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  customer_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  type TEXT DEFAULT 'customer',
  store_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(store_id)
);

-- Piutang table
CREATE TABLE IF NOT EXISTS piutang (
  piutang_id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  store_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  due_date DATETIME,
  status TEXT DEFAULT 'belum_lunas',
  paid_amount REAL DEFAULT 0,
  paid_at DATETIME,
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
  FOREIGN KEY (store_id) REFERENCES stores(store_id),
  FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  supplier_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  store_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(store_id)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  product_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  category TEXT,
  unit TEXT NOT NULL,
  buying_price REAL,
  selling_price REAL,
  supplier_id TEXT,
  status TEXT DEFAULT 'active',
  store_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id),
  FOREIGN KEY (store_id) REFERENCES stores(store_id)
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
  inventory_id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  store_id INTEGER NOT NULL,
  current_stock REAL DEFAULT 0,
  minimum_stock REAL DEFAULT 0,
  maximum_stock REAL,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(product_id),
  FOREIGN KEY (store_id) REFERENCES stores(store_id)
);

-- Inventory Transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
  inventory_transaction_id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  store_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  quantity REAL NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  notes TEXT,
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(product_id),
  FOREIGN KEY (store_id) REFERENCES stores(store_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
  wallet_id TEXT PRIMARY KEY,
  store_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  balance REAL DEFAULT 0,
  account_number TEXT,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(store_id)
);

-- Payroll Configuration table
CREATE TABLE IF NOT EXISTS payroll_config (
  payroll_config_id TEXT PRIMARY KEY,
  payroll_cycle TEXT NOT NULL DEFAULT '30',
  overtime_rate REAL NOT NULL DEFAULT 10000,
  start_date TEXT NOT NULL,
  next_payroll_date TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_stores_user_id ON user_stores(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stores_store_id ON user_stores(store_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_store_id ON attendance(store_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_sales_store_id ON sales(store_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
CREATE INDEX IF NOT EXISTS idx_cashflow_store_id ON cashflow(store_id);
CREATE INDEX IF NOT EXISTS idx_cashflow_date ON cashflow(date);
CREATE INDEX IF NOT EXISTS idx_payroll_user_id ON payroll(user_id);
CREATE INDEX IF NOT EXISTS idx_payroll_month ON payroll(month);
CREATE INDEX IF NOT EXISTS idx_customers_store_id ON customers(store_id);
CREATE INDEX IF NOT EXISTS idx_piutang_customer_id ON piutang(customer_id);
CREATE INDEX IF NOT EXISTS idx_piutang_store_id ON piutang(store_id);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_store_id ON inventory(store_id);