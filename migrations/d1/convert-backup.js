/**
 * Convert MySQL Backup to D1 Format
 * Converts existing MySQL backup file to D1-compatible SQL
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the latest backup file
function getLatestBackup() {
  const backupDir = path.join(__dirname, '../../database_backup');
  const files = fs.readdirSync(backupDir)
    .filter(f => f.endsWith('.sql'))
    .sort()
    .reverse();
  
  if (files.length === 0) {
    throw new Error('No backup files found');
  }
  
  return path.join(backupDir, files[0]);
}

// Convert MySQL syntax to SQLite/D1 syntax
function convertMySQLToD1(mysqlSql) {
  let d1Sql = mysqlSql;
  
  // Remove MySQL-specific statements
  d1Sql = d1Sql.replace(/USE `[^`]+`;/g, '');
  d1Sql = d1Sql.replace(/SET [^;]+;/g, '');
  d1Sql = d1Sql.replace(/\/\*![^*]*\*\//g, '');
  
  // Convert table creation
  d1Sql = d1Sql.replace(/ENGINE=InnoDB DEFAULT CHARSET=[^;]+/g, '');
  d1Sql = d1Sql.replace(/COLLATE=[^)\s]+/g, '');
  d1Sql = d1Sql.replace(/DEFAULT CHARSET=[^)\s]+/g, '');
  
  // Convert data types
  d1Sql = d1Sql.replace(/varchar\(([^)]+)\)/gi, 'TEXT');
  d1Sql = d1Sql.replace(/text/gi, 'TEXT');
  d1Sql = d1Sql.replace(/int(\([^)]*\))?/gi, 'INTEGER');
  d1Sql = d1Sql.replace(/decimal\([^)]+\)/gi, 'REAL');
  d1Sql = d1Sql.replace(/timestamp/gi, 'TEXT');
  
  // Convert DEFAULT values
  d1Sql = d1Sql.replace(/DEFAULT \(now\(\)\)/gi, "DEFAULT CURRENT_TIMESTAMP");
  d1Sql = d1Sql.replace(/DEFAULT CURRENT_TIMESTAMP\(\)/gi, "DEFAULT CURRENT_TIMESTAMP");
  d1Sql = d1Sql.replace(/DEFAULT \(_utf8mb4'([^']+)'\)/gi, "DEFAULT '$1'");
  
  // Remove MySQL-specific syntax
  d1Sql = d1Sql.replace(/AUTO_INCREMENT/gi, 'AUTOINCREMENT');
  d1Sql = d1Sql.replace(/PRIMARY KEY \(`([^`]+)`\)/gi, 'PRIMARY KEY ($1)');
  
  // Convert backticks to regular quotes for SQLite
  d1Sql = d1Sql.replace(/`([^`]+)`/g, '$1');
  
  // Handle UNIQUE constraints
  d1Sql = d1Sql.replace(/UNIQUE KEY `[^`]+` \(`([^`]+)`\)/gi, 'UNIQUE ($1)');
  
  return d1Sql;
}

// Generate UUID for SQLite (fallback for missing UUIDs)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Process INSERT statements
function processInserts(sqlContent) {
  const lines = sqlContent.split('\n');
  const processedLines = [];
  
  for (let line of lines) {
    // Skip comments and empty lines
    if (line.trim().startsWith('--') || line.trim() === '') {
      processedLines.push(line);
      continue;
    }
    
    // Process INSERT statements
    if (line.trim().startsWith('INSERT INTO')) {
      // Convert backticks in table names
      line = line.replace(/INSERT INTO `([^`]+)`/g, 'INSERT INTO $1');
      
      // Handle VALUES with proper escaping
      line = line.replace(/VALUES \(/g, 'VALUES (');
      
      // Convert timestamps in data
      line = line.replace(/'(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})'/g, "'$1'");
      
      processedLines.push(line);
    } else {
      processedLines.push(line);
    }
  }
  
  return processedLines.join('\n');
}

async function convertBackup() {
  console.log('🔄 Converting MySQL backup to D1 format...');
  
  try {
    // Get latest backup
    const backupFile = getLatestBackup();
    console.log(`📂 Reading backup: ${path.basename(backupFile)}`);
    
    // Read backup content
    const mysqlContent = fs.readFileSync(backupFile, 'utf8');
    
    // Convert structure
    console.log('🔧 Converting MySQL syntax to D1/SQLite...');
    let d1Content = convertMySQLToD1(mysqlContent);
    
    // Process data
    console.log('📊 Processing INSERT statements...');
    d1Content = processInserts(d1Content);
    
    // Add D1 header
    const d1Header = `-- D1 Database Import
-- Converted from MySQL backup: ${path.basename(backupFile)}
-- Generated: ${new Date().toISOString()}

PRAGMA foreign_keys = OFF;

`;
    
    const d1Footer = `
PRAGMA foreign_keys = ON;

-- Conversion completed successfully!
`;
    
    const finalContent = d1Header + d1Content + d1Footer;
    
    // Write D1 file
    const outputFile = path.join(__dirname, 'data-import.sql');
    fs.writeFileSync(outputFile, finalContent);
    
    console.log('✅ Conversion completed successfully!');
    console.log(`📁 D1 import file: ${outputFile}`);
    
    // Statistics
    const structureLines = finalContent.split('\n').filter(l => 
      l.trim().startsWith('CREATE TABLE') || 
      l.trim().startsWith('INSERT INTO')
    );
    
    const tables = structureLines.filter(l => l.includes('CREATE TABLE')).length;
    const inserts = structureLines.filter(l => l.includes('INSERT INTO')).length;
    
    console.log(`\n📊 Conversion Statistics:`);
    console.log(`   Tables: ${tables}`);
    console.log(`   Data rows: ${inserts}`);
    
    console.log(`\n📝 Next steps:`);
    console.log(`1. Create D1 database: wrangler d1 create staff_management_db`);
    console.log(`2. Create schema: wrangler d1 execute staff_management_db --file=migrations/d1/schema.sql`);
    console.log(`3. Import data: wrangler d1 execute staff_management_db --file=${outputFile}`);
    
  } catch (error) {
    console.error('❌ Conversion failed:', error);
    process.exit(1);
  }
}

// Run conversion
convertBackup().catch(console.error);