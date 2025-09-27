-- D1 Database Import
-- Converted from MySQL backup: mysql_backup_2025-09-26T18-28-48-808Z.sql
-- Generated: 2025-09-27T04:16:38.498Z

PRAGMA foreign_keys = OFF;

-- MySQL Database Backup
-- Generated: 2025-09-26T18:28:50.889Z
-- Database: defaultdb



-- Table: attendance
DROP TABLE IF EXISTS attendance;
CREATE TABLE attendance (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  store_id INTEGER NOT NULL,
  date TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  check_in TEXT,
  check_out TEXT,
  shift TEXT,
  lateness_minutes INTEGER DEFAULT '0',
  overtime_minutes INTEGER DEFAULT '0',
  break_duration INTEGER DEFAULT '0',
  overtime REAL DEFAULT '0.00',
  notes TEXT,
  attendance_status TEXT DEFAULT 'belum_diatur',
  status TEXT DEFAULT 'pending',
  created_at TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ;

-- Table: cashflow
DROP TABLE IF EXISTS cashflow;
CREATE TABLE cashflow (
  id TEXT NOT NULL,
  store_id INTEGER NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT,
  customer_id TEXT DEFAULT NULL,
  piutang_id TEXT DEFAULT NULL,
  payment_status TEXT DEFAULT 'lunas',
  jumlah_galon REAL DEFAULT NULL,
  pajak_ongkos REAL DEFAULT NULL,
  pajak_transfer REAL DEFAULT '2500.00',
  total_pengeluaran REAL DEFAULT NULL,
  konter TEXT,
  pajak_transfer_rekening REAL DEFAULT NULL,
  hasil REAL DEFAULT NULL,
  date TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ;

-- Table: customers
DROP TABLE IF EXISTS customers;
CREATE TABLE customers (
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  type TEXT DEFAULT 'customer',
  store_id INTEGER NOT NULL,
  created_at TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ;

-- Table: inventory
DROP TABLE IF EXISTS inventory;
CREATE TABLE inventory (
  id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  store_id INTEGER NOT NULL,
  current_stock REAL DEFAULT '0.000',
  minimum_stock REAL DEFAULT '0.000',
  maximum_stock REAL DEFAULT NULL,
  last_updated TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ;

-- Table: inventory_transactions
DROP TABLE IF EXISTS inventory_transactions;
CREATE TABLE inventory_transactions (
  id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  store_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  quantity REAL NOT NULL,
  reference_type TEXT,
  reference_id TEXT DEFAULT NULL,
  notes TEXT,
  user_id TEXT NOT NULL,
  created_at TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ;

-- Table: overtime
DROP TABLE IF EXISTS overtime;
CREATE TABLE overtime (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  store_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  hours REAL NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  approved_by TEXT DEFAULT NULL,
  approved_at TEXT NULL DEFAULT NULL,
  created_at TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ;

-- Table: payroll
DROP TABLE IF EXISTS payroll;
CREATE TABLE payroll (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  store_id INTEGER NOT NULL,
  month TEXT NOT NULL,
  base_salary REAL NOT NULL,
  overtime_pay REAL DEFAULT '0.00',
  bonuses TEXT,
  deductions TEXT,
  total_amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  paid_at TEXT NULL DEFAULT NULL,
  created_at TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ;

-- Table: payroll_config
DROP TABLE IF EXISTS payroll_config;
CREATE TABLE payroll_config (
  id TEXT NOT NULL,
  payroll_cycle TEXT NOT NULL DEFAULT '30',
  overtime_rate REAL NOT NULL DEFAULT '10000.00',
  start_date TEXT NOT NULL,
  next_payroll_date TEXT,
  is_active tinyINTEGER DEFAULT '1',
  created_at TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ;

-- Table: piutang
DROP TABLE IF EXISTS piutang;
CREATE TABLE piutang (
  id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  store_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  due_date TEXT NULL DEFAULT NULL,
  status TEXT DEFAULT 'belum_lunas',
  paid_amount REAL DEFAULT '0.00',
  paid_at TEXT NULL DEFAULT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ;

-- Table: products
DROP TABLE IF EXISTS products;
CREATE TABLE products (
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  category TEXT,
  unit TEXT NOT NULL,
  buying_price REAL DEFAULT NULL,
  selling_price REAL DEFAULT NULL,
  supplier_id TEXT DEFAULT NULL,
  status TEXT DEFAULT 'active',
  store_id INTEGER NOT NULL,
  created_at TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ;

-- Table: proposals
DROP TABLE IF EXISTS proposals;
CREATE TABLE proposals (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  store_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  estimated_cost REAL DEFAULT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  reviewed_by TEXT DEFAULT NULL,
  reviewed_at TEXT NULL DEFAULT NULL,
  created_at TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ;

-- Table: sales
DROP TABLE IF EXISTS sales;
CREATE TABLE sales (
  id TEXT NOT NULL,
  store_id INTEGER NOT NULL,
  user_id TEXT DEFAULT NULL,
  date TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  total_sales REAL NOT NULL,
  transactions INTEGER NOT NULL,
  average_ticket REAL DEFAULT NULL,
  total_qris REAL DEFAULT '0.00',
  total_cash REAL DEFAULT '0.00',
  meter_start REAL DEFAULT NULL,
  meter_end REAL DEFAULT NULL,
  total_liters REAL DEFAULT NULL,
  total_income REAL DEFAULT '0.00',
  total_expenses REAL DEFAULT '0.00',
  income_details TEXT,
  expense_details TEXT,
  shift TEXT,
  check_in TEXT,
  check_out TEXT,
  submission_date TEXT,
  created_at TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ;

-- Data for table: sales
INSERT INTEGERO sales (id, store_id, user_id, date, total_sales, transactions, average_ticket, total_qris, total_cash, meter_start, meter_end, total_liters, total_income, total_expenses, income_details, expense_details, shift, check_in, check_out, submission_date, created_at) VALUES ('aee293f8-31db-479b-9db2-056d99da2a38', 1, '68ceed41-485b-43eb-8ef5-b805db398cb0', '2025-09-25 00:00:00.000', '688250.00', 7, '98321.43', '180000.00', '688250.00', '1964.780', '2040.280', '75.500', NULL, NULL, NULL, NULL, 'siang', '14:00', '23:01', NULL, '2025-09-26 08:56:57.000');

-- Table: setoran
DROP TABLE IF EXISTS setoran;
CREATE TABLE setoran (
  id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  employee_id TEXT DEFAULT NULL,
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
  created_at TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ;

-- Table: stores
DROP TABLE IF EXISTS stores;
CREATE TABLE stores (
  id INTEGER NOT NULL,
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
  created_at TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ;

-- Data for table: stores
INSERT INTEGERO stores (id, name, address, phone, manager, description, status, entry_time_start, entry_time_end, exit_time_start, exit_time_end, timezone, created_at) VALUES (1, '123', '123 Main Street', '021-1234567', 'SPBU Manager', 'Main store location with full services', 'active', '07:00', '09:00', '17:00', '19:00', 'Asia/Jakarta', '2025-09-26 01:23:52.000');
INSERT INTEGERO stores (id, name, address, phone, manager, description, status, entry_time_start, entry_time_end, exit_time_start, exit_time_end, timezone, created_at) VALUES (2, 'Branch Store', '456 Branch Avenue', '021-2345678', NULL, 'Branch store location', 'active', '07:00', '09:00', '17:00', '19:00', 'Asia/Jakarta', '2025-09-26 01:23:52.000');

-- Table: suppliers
DROP TABLE IF EXISTS suppliers;
CREATE TABLE suppliers (
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  store_id INTEGER NOT NULL,
  created_at TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ;

-- Table: user_stores
DROP TABLE IF EXISTS user_stores;
CREATE TABLE user_stores (
  id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  store_id INTEGER NOT NULL,
  created_at TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ;

-- Data for table: user_stores
INSERT INTEGERO user_stores (id, user_id, store_id, created_at) VALUES ('00358a93-171b-455a-9490-8015cee25fd9', 'df880e37-a056-436d-a258-6f3e8262bc1d', 1, '2025-09-26 01:23:54.000');
INSERT INTEGERO user_stores (id, user_id, store_id, created_at) VALUES ('8196ba30-9b9c-493b-9e5c-3d1308738520', '54a63740-4b35-4caa-87da-62c597b0665f', 1, '2025-09-26 01:23:54.000');
INSERT INTEGERO user_stores (id, user_id, store_id, created_at) VALUES ('85ccf344-60b4-4af4-af4d-8110d8202bbb', '40603306-34ce-4e7b-845d-32c2fc4aee93', 2, '2025-09-26 01:23:54.000');
INSERT INTEGERO user_stores (id, user_id, store_id, created_at) VALUES ('a5432181-bfc8-41f4-b5f0-4cde121faf32', '4e6f8c80-2116-414d-918b-2adb872bb3d7', 1, '2025-09-26 01:23:54.000');
INSERT INTEGERO user_stores (id, user_id, store_id, created_at) VALUES ('aa369040-be59-46c8-84d1-da46c27ada87', '40603306-34ce-4e7b-845d-32c2fc4aee93', 1, '2025-09-26 01:23:54.000');
INSERT INTEGERO user_stores (id, user_id, store_id, created_at) VALUES ('b8db0d76-51b7-4ae7-a962-6d853da2ea8a', '68ceed41-485b-43eb-8ef5-b805db398cb0', 1, '2025-09-26 01:23:54.000');
INSERT INTEGERO user_stores (id, user_id, store_id, created_at) VALUES ('eadcbbaf-ed21-42fc-b0a3-ed5748fd29d2', '4e6f8c80-2116-414d-918b-2adb872bb3d7', 2, '2025-09-26 01:23:54.000');

-- Table: users
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  salary REAL DEFAULT NULL,
  created_at TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY users_email_unique (email)
) ;

-- Data for table: users
INSERT INTEGERO users (id, email, password, name, role, phone, salary, created_at) VALUES ('40603306-34ce-4e7b-845d-32c2fc4aee93', 'manager@spbu.com', '5271478b189e6f1a73a316f86209ec8900d93fa807d652fc52c5951b8ab154188a4a1525c47fce5f96b066b881a401e4ae071c81415a00f69f460b78efaeca2d.da313ffd30f2db8b47324dc4f8790eb5', 'SPBU Manager', 'manager', NULL, '15000000.00', '2025-09-26 01:23:54.000');
INSERT INTEGERO users (id, email, password, name, role, phone, salary, created_at) VALUES ('4e6f8c80-2116-414d-918b-2adb872bb3d7', 'admin@spbu.com', '759776d92a32102a24edb143b4f36cf660affaf3d9fa784fe630f35774134f8aecacfbcae9e029d6581944c3cd7ac04e959a8b60b2d891905681ea4ebe48c32a.20118937654ceaf9c2243452b9d45176', 'SPBU Administrator', 'administrasi', NULL, '12000000.00', '2025-09-26 01:23:54.000');
INSERT INTEGERO users (id, email, password, name, role, phone, salary, created_at) VALUES ('54a63740-4b35-4caa-87da-62c597b0665f', 'hafiz@spbu.com', 'f8e14a0f76ba4974428766d8553eadf7ab401c0701954efc4f4f4c57849617d3528a7e0a9ecc75fed8c8310951ef8a31e9f52e5900e9a7313eb9ca1e9fdd8bd3.0cf9d50b14833796f0b545a01b1878d4', 'Hafiz', 'staff', NULL, '8000000.00', '2025-09-26 01:23:54.000');
INSERT INTEGERO users (id, email, password, name, role, phone, salary, created_at) VALUES ('68ceed41-485b-43eb-8ef5-b805db398cb0', 'putri@spbu.com', '89f4b4d54a5f0f28b586ef8936300d987322e4572afb57e9d4f986cba650252b04a31f619deedeace07cdc503e77f3e9e4352901295a50e80f3d7e1bc27688d2.4e5f7e37609aab482b30efd65cdd5197', 'Putri', 'staff', NULL, '8000000.00', '2025-09-26 01:23:54.000');
INSERT INTEGERO users (id, email, password, name, role, phone, salary, created_at) VALUES ('df880e37-a056-436d-a258-6f3e8262bc1d', 'endang@spbu.com', '0659c1c5370c59ef337def93d03324cb6a9a9929019b687bedb9efb1c1cb1251011e3a355b1ecf6b5377f0ebb4dffe0c9d5502b64ffa6de9dab62a1295abee67.a7692c21b1dffba27338067710e85d2a', 'Endang', 'staff', NULL, '8000000.00', '2025-09-26 01:23:54.000');

-- Table: wallets
DROP TABLE IF EXISTS wallets;
CREATE TABLE wallets (
  id TEXT NOT NULL,
  store_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  balance REAL DEFAULT '0.00',
  account_number TEXT,
  description TEXT,
  is_active tinyINTEGER DEFAULT '1',
  created_at TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ;


PRAGMA foreign_keys = ON;

-- Conversion completed successfully!
