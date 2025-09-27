import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Transaction type constants
export const TRANSACTION_TYPES = {
  PEMBERIAN_UTANG: "Pemberian Utang",
  PEMBAYARAN_PIUTANG: "Pembayaran Piutang",
  PEMBELIAN_MINYAK: "Pembelian stok (Pembelian Minyak)",
  PEMBELIAN_MINYAK_ALT: "Pembelian Minyak",
  TRANSFER_REKENING: "Transfer Rekening",
  PENJUALAN_TRANSFER: "Penjualan (Transfer rekening)"
} as const;

// Generate UUID for SQLite/D1
const generateUUID = () => crypto.randomUUID();

// Users table - D1/SQLite version
export const users = sqliteTable("users", {
  id: text("user_id").primaryKey().$defaultFn(generateUUID),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'staff', 'manager', 'administrasi'
  phone: text("phone"),
  salary: real("salary"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// User-Store assignment table - D1/SQLite version
export const userStores = sqliteTable("user_stores", {
  id: text("user_store_id").primaryKey().$defaultFn(generateUUID),
  userId: text("user_id").notNull(),
  storeId: integer("store_id").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Stores table - D1/SQLite version (keeping integer ID)
export const stores = sqliteTable("stores", {
  id: integer("store_id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  manager: text("manager"),
  description: text("description"),
  status: text("status").default("active"), // 'active', 'inactive'
  // Entry/Exit time settings
  entryTimeStart: text("entry_time_start").default("07:00"),
  entryTimeEnd: text("entry_time_end").default("09:00"),
  exitTimeStart: text("exit_time_start").default("17:00"),
  exitTimeEnd: text("exit_time_end").default("19:00"),
  timezone: text("timezone").default("Asia/Jakarta"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Attendance table - D1/SQLite version
export const attendance = sqliteTable("attendance", {
  id: text("attendance_id").primaryKey().$defaultFn(generateUUID),
  userId: text("user_id").notNull(),
  storeId: integer("store_id").notNull(),
  date: text("date").default(sql`CURRENT_TIMESTAMP`),
  checkIn: text("check_in"),
  checkOut: text("check_out"),
  shift: text("shift"),
  latenessMinutes: integer("lateness_minutes").default(0),
  overtimeMinutes: integer("overtime_minutes").default(0),
  breakDuration: integer("break_duration").default(0),
  overtime: real("overtime").default(0),
  notes: text("notes"),
  attendanceStatus: text("attendance_status").default("belum_diatur"),
  status: text("status").default("pending"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Sales table - D1/SQLite version
export const sales = sqliteTable("sales", {
  id: text("sales_id").primaryKey().$defaultFn(generateUUID),
  storeId: integer("store_id").notNull(),
  userId: text("user_id"),
  date: text("date").default(sql`CURRENT_TIMESTAMP`),
  totalSales: real("total_sales").notNull(),
  transactions: integer("transactions").notNull(),
  averageTicket: real("average_ticket"),
  // Payment breakdown
  totalQris: real("total_qris").default(0),
  totalCash: real("total_cash").default(0),
  // Meter readings
  meterStart: real("meter_start"),
  meterEnd: real("meter_end"),
  totalLiters: real("total_liters"),
  // PU (Income/Expenses)
  totalIncome: real("total_income").default(0),
  totalExpenses: real("total_expenses").default(0),
  incomeDetails: text("income_details"),
  expenseDetails: text("expense_details"),
  // Shift information
  shift: text("shift"),
  checkIn: text("check_in"),
  checkOut: text("check_out"),
  // One submission per day validation
  submissionDate: text("submission_date"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Cashflow table - D1/SQLite version
export const cashflow = sqliteTable("cashflow", {
  id: text("cashflow_id").primaryKey().$defaultFn(generateUUID),
  storeId: integer("store_id").notNull(),
  category: text("category").notNull(),
  type: text("type").notNull(),
  amount: real("amount").notNull(),
  description: text("description"),
  // Customer and payment tracking fields
  customerId: text("customer_id"),
  piutangId: text("piutang_id"),
  paymentStatus: text("payment_status").default("lunas"),
  // Fields for Pembelian Minyak
  jumlahGalon: real("jumlah_galon"),
  pajakOngkos: real("pajak_ongkos"),
  pajakTransfer: real("pajak_transfer").default(2500),
  totalPengeluaran: real("total_pengeluaran"),
  // Fields for Transfer Rekening
  konter: text("konter"),
  pajakTransferRekening: real("pajak_transfer_rekening"),
  hasil: real("hasil"),
  date: text("date").default(sql`CURRENT_TIMESTAMP`),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Payroll table - D1/SQLite version
export const payroll = sqliteTable("payroll", {
  id: text("payroll_id").primaryKey().$defaultFn(generateUUID),
  userId: text("user_id").notNull(),
  storeId: integer("store_id").notNull(),
  month: text("month").notNull(),
  baseSalary: real("base_salary").notNull(),
  overtimePay: real("overtime_pay").default(0),
  bonuses: text("bonuses"),
  deductions: text("deductions"),
  totalAmount: real("total_amount").notNull(),
  status: text("status").default("pending"),
  paidAt: text("paid_at"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Proposals table - D1/SQLite version
export const proposals = sqliteTable("proposals", {
  id: text("proposal_id").primaryKey().$defaultFn(generateUUID),
  userId: text("user_id").notNull(),
  storeId: integer("store_id").notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  estimatedCost: real("estimated_cost"),
  description: text("description").notNull(),
  status: text("status").default("pending"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: text("reviewed_at"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Overtime table - D1/SQLite version
export const overtime = sqliteTable("overtime", {
  id: text("overtime_id").primaryKey().$defaultFn(generateUUID),
  userId: text("user_id").notNull(),
  storeId: integer("store_id").notNull(),
  date: text("date").notNull(),
  hours: real("hours").notNull(),
  reason: text("reason").notNull(),
  status: text("status").default("pending"),
  approvedBy: text("approved_by"),
  approvedAt: text("approved_at"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Setoran table - D1/SQLite version
export const setoran = sqliteTable("setoran", {
  id: text("setoran_id").primaryKey().$defaultFn(generateUUID),
  employeeName: text("employee_name").notNull(),
  employeeId: text("employee_id"),
  jamMasuk: text("jam_masuk").notNull(),
  jamKeluar: text("jam_keluar").notNull(),
  nomorAwal: real("nomor_awal").notNull(),
  nomorAkhir: real("nomor_akhir").notNull(),
  totalLiter: real("total_liter").notNull(),
  totalSetoran: real("total_setoran").notNull(),
  qrisSetoran: real("qris_setoran").notNull(),
  cashSetoran: real("cash_setoran").notNull(),
  expensesData: text("expenses_data"),
  totalExpenses: real("total_expenses").notNull(),
  incomeData: text("income_data"),
  totalIncome: real("total_income").notNull(),
  totalKeseluruhan: real("total_keseluruhan").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Customers table - D1/SQLite version
export const customers = sqliteTable("customers", {
  id: text("customer_id").primaryKey().$defaultFn(generateUUID),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  type: text("type").default("customer"),
  storeId: integer("store_id").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Piutang table - D1/SQLite version
export const piutang = sqliteTable("piutang", {
  id: text("piutang_id").primaryKey().$defaultFn(generateUUID),
  customerId: text("customer_id").notNull(),
  storeId: integer("store_id").notNull(),
  amount: real("amount").notNull(),
  description: text("description").notNull(),
  dueDate: text("due_date"),
  status: text("status").default("belum_lunas"),
  paidAmount: real("paid_amount").default(0),
  paidAt: text("paid_at"),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Suppliers table - D1/SQLite version
export const suppliers = sqliteTable("suppliers", {
  id: text("supplier_id").primaryKey().$defaultFn(generateUUID),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  description: text("description"),
  status: text("status").default("active"),
  storeId: integer("store_id").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Products table - D1/SQLite version
export const products = sqliteTable("products", {
  id: text("product_id").primaryKey().$defaultFn(generateUUID),
  name: text("name").notNull(),
  description: text("description"),
  sku: text("sku"),
  category: text("category"),
  unit: text("unit").notNull(),
  buyingPrice: real("buying_price"),
  sellingPrice: real("selling_price"),
  supplierId: text("supplier_id"),
  status: text("status").default("active"),
  storeId: integer("store_id").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Inventory table - D1/SQLite version
export const inventory = sqliteTable("inventory", {
  id: text("inventory_id").primaryKey().$defaultFn(generateUUID),
  productId: text("product_id").notNull(),
  storeId: integer("store_id").notNull(),
  currentStock: real("current_stock").default(0),
  minimumStock: real("minimum_stock").default(0),
  maximumStock: real("maximum_stock"),
  lastUpdated: text("last_updated").default(sql`CURRENT_TIMESTAMP`),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Inventory Transactions table - D1/SQLite version
export const inventoryTransactions = sqliteTable("inventory_transactions", {
  id: text("inventory_transaction_id").primaryKey().$defaultFn(generateUUID),
  productId: text("product_id").notNull(),
  storeId: integer("store_id").notNull(),
  type: text("type").notNull(),
  quantity: real("quantity").notNull(),
  referenceType: text("reference_type"),
  referenceId: text("reference_id"),
  notes: text("notes"),
  userId: text("user_id").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Wallets table - D1/SQLite version
export const wallets = sqliteTable("wallets", {
  id: text("wallet_id").primaryKey().$defaultFn(generateUUID),
  storeId: integer("store_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  balance: real("balance").default(0),
  accountNumber: text("account_number"),
  description: text("description"),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Payroll Configuration table - D1/SQLite version
export const payrollConfig = sqliteTable("payroll_config", {
  id: text("payroll_config_id").primaryKey().$defaultFn(generateUUID),
  payrollCycle: text("payroll_cycle").notNull().default("30"),
  overtimeRate: real("overtime_rate").notNull().default(10000),
  startDate: text("start_date").notNull(),
  nextPayrollDate: text("next_payroll_date"),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Insert schemas (same as MySQL version but for D1)
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  salary: true,
}).extend({
  storeIds: z.array(z.number()).min(1, "Please select at least one store"),
  salary: z.coerce.number().min(0, "Salary must be a positive number").optional(),
});

export const insertUserStoreSchema = createInsertSchema(userStores).omit({
  id: true,
  createdAt: true,
});

export const insertStoreSchema = createInsertSchema(stores).omit({
  id: true,
  createdAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
  status: true,
  attendanceStatus: true,
});

export const insertSalesSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
});

export const insertCashflowSchema = createInsertSchema(cashflow).omit({
  id: true,
  createdAt: true,
}).extend({
  paymentStatus: z.enum(["lunas", "belum_lunas"]).default("lunas"),
});

export const insertPayrollSchema = createInsertSchema(payroll).omit({
  id: true,
  createdAt: true,
  status: true,
  paidAt: true,
});

// All other insert schemas...
export const insertProposalSchema = createInsertSchema(proposals).omit({
  id: true,
  createdAt: true,
  status: true,
  reviewedBy: true,
  reviewedAt: true,
});

export const insertOvertimeSchema = createInsertSchema(overtime).omit({
  id: true,
  createdAt: true,
  status: true,
  approvedBy: true,
  approvedAt: true,
});

export const insertSetoranSchema = createInsertSchema(setoran).omit({
  id: true,
  createdAt: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertPiutangSchema = createInsertSchema(piutang).omit({
  id: true,
  createdAt: true,
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPayrollConfigSchema = createInsertSchema(payrollConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  nextPayrollDate: true,
}).extend({
  overtimeRate: z.coerce.number().min(0, "Overtime rate must be positive"),
});

// Types (same as MySQL but for D1)
export type User = typeof users.$inferSelect & { 
  stores?: Store[];
  storeId?: number;
};
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserStore = typeof userStores.$inferSelect;
export type InsertUserStore = z.infer<typeof insertUserStoreSchema>;
export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Sales = typeof sales.$inferSelect;
export type InsertSales = z.infer<typeof insertSalesSchema>;
export type Cashflow = typeof cashflow.$inferSelect;
export type InsertCashflow = z.infer<typeof insertCashflowSchema>;
export type Payroll = typeof payroll.$inferSelect;
export type InsertPayroll = z.infer<typeof insertPayrollSchema>;
export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Overtime = typeof overtime.$inferSelect;
export type InsertOvertime = z.infer<typeof insertOvertimeSchema>;
export type Setoran = typeof setoran.$inferSelect;
export type InsertSetoran = z.infer<typeof insertSetoranSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Piutang = typeof piutang.$inferSelect;
export type InsertPiutang = z.infer<typeof insertPiutangSchema>;
export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type PayrollConfig = typeof payrollConfig.$inferSelect;
export type InsertPayrollConfig = z.infer<typeof insertPayrollConfigSchema>;

// Insert schemas for inventory management tables
export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions).omit({
  id: true,
  createdAt: true,
});

// Types for inventory management tables
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type InsertInventoryTransaction = z.infer<typeof insertInventoryTransactionSchema>;

// Extended types with related data for inventory
export type ProductWithSupplier = Product & {
  supplier?: Supplier;
};

export type InventoryWithProduct = Inventory & {
  product: Product;
  supplier?: Supplier;
};

export type InventoryTransactionWithProduct = InventoryTransaction & {
  product: Product;
  user?: User;
};

// Extended types with related data
export type AttendanceWithEmployee = Attendance & {
  employeeName: string;
  employeeRole: string;
};