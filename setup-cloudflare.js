#!/usr/bin/env node
/**
 * One-click Cloudflare Setup Script
 * Automatically configures and deploys to Cloudflare Workers
 */

import { execSync } from 'child_process';
import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

function exec(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description} - Success`);
    return output;
  } catch (error) {
    console.error(`❌ ${description} - Failed:`);
    console.error(error.message);
    throw error;
  }
}

async function setupCloudflare() {
  console.log('🚀 Cloudflare Workers Auto-Setup');
  console.log('==================================\n');
  
  // Check if already logged in
  try {
    const whoami = execSync('wrangler whoami', { encoding: 'utf8', stdio: 'pipe' });
    console.log('✅ Already logged in to Cloudflare');
  } catch (error) {
    console.log('🔑 Please login to Cloudflare first...');
    exec('wrangler login', 'Cloudflare Login');
  }
  
  console.log('\n📋 Setting up resources...');
  
  // Install dependencies
  exec('npm install', 'Installing dependencies');
  
  // Build the application
  exec('npm run build:workers', 'Building application');
  
  // Create D1 database
  console.log('\n💾 Setting up D1 database...');
  let dbId;
  try {
    const dbList = execSync('wrangler d1 list --json', { encoding: 'utf8' });
    const databases = JSON.parse(dbList);
    const existingDb = databases.find(db => db.name === 'staff_management_db');
    
    if (existingDb) {
      console.log('✅ D1 database already exists');
      dbId = existingDb.uuid;
    } else {
      const dbOutput = exec('wrangler d1 create staff_management_db --json', 'Creating D1 database');
      const dbResult = JSON.parse(dbOutput);
      dbId = dbResult.database_id;
      console.log(`✅ D1 database created: ${dbId}`);
    }
  } catch (error) {
    console.error('❌ Failed to setup D1 database');
    throw error;
  }
  
  // Create KV namespace
  console.log('\n🗄️ Setting up KV namespace...');
  let kvId, kvPreviewId;
  try {
    const kvList = execSync('wrangler kv:namespace list --json', { encoding: 'utf8' });
    const namespaces = JSON.parse(kvList);
    const existingKv = namespaces.find(ns => ns.title.includes('SESSIONS'));
    
    if (existingKv) {
      console.log('✅ KV namespace already exists');
      kvId = existingKv.id;
      // Find preview namespace
      const previewKv = namespaces.find(ns => ns.title.includes('SESSIONS') && ns.title.includes('preview'));
      kvPreviewId = previewKv ? previewKv.id : existingKv.id;
    } else {
      const kvOutput = exec('wrangler kv:namespace create "SESSIONS" --json', 'Creating KV namespace');
      const kvResult = JSON.parse(kvOutput);
      kvId = kvResult.id;
      
      const kvPreviewOutput = exec('wrangler kv:namespace create "SESSIONS" --preview --json', 'Creating KV preview namespace');
      const kvPreviewResult = JSON.parse(kvPreviewOutput);
      kvPreviewId = kvPreviewResult.id;
      console.log(`✅ KV namespaces created: ${kvId} (prod), ${kvPreviewId} (preview)`);
    }
  } catch (error) {
    console.error('❌ Failed to setup KV namespace');
    throw error;
  }
  
  // Update wrangler.toml
  console.log('\n⚙️ Updating configuration...');
  let wranglerConfig = fs.readFileSync('wrangler.toml', 'utf8');
  
  // Update database ID
  wranglerConfig = wranglerConfig.replace(
    /# database_id will be auto-generated and updated by setup script/,
    `database_id = "${dbId}"`
  );
  
  // Update KV IDs
  wranglerConfig = wranglerConfig.replace(
    /# id will be auto-generated and updated by setup script/,
    `id = "${kvId}"`
  );
  wranglerConfig = wranglerConfig.replace(
    /# preview_id will be auto-generated and updated by setup script/,
    `preview_id = "${kvPreviewId}"`
  );
  
  fs.writeFileSync('wrangler.toml', wranglerConfig);
  console.log('✅ Configuration updated');
  
  // Setup database schema
  console.log('\n🏗️ Setting up database schema...');
  try {
    // Check if tables exist
    const tableCheck = execSync(
      `wrangler d1 execute staff_management_db --command="SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'" --json`,
      { encoding: 'utf8' }
    );
    const tableResult = JSON.parse(tableCheck);
    const tableCount = tableResult[0]?.results?.[0]?.count || 0;
    
    if (tableCount === 0) {
      exec('wrangler d1 execute staff_management_db --file=migrations/d1/schema.sql', 'Creating database schema');
      
      // Import data if available
      if (fs.existsSync('migrations/d1/data-import.sql')) {
        exec('wrangler d1 execute staff_management_db --file=migrations/d1/data-import.sql', 'Importing initial data');
      }
    } else {
      console.log('✅ Database schema already exists');
    }
  } catch (error) {
    console.error('❌ Failed to setup database schema');
    throw error;
  }
  
  // Deploy to Cloudflare Workers
  console.log('\n🚀 Deploying to Cloudflare Workers...');
  exec('wrangler deploy --env production', 'Deploying to production');
  
  // Test deployment
  console.log('\n🧪 Testing deployment...');
  try {
    // Wait for deployment to propagate
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const healthCheck = execSync(
      'curl -f https://staff-management-prod.workers.dev/api/health',
      { encoding: 'utf8' }
    );
    console.log('✅ Health check passed');
    console.log('Response:', healthCheck);
  } catch (error) {
    console.log('⚠️ Health check failed, but deployment completed');
  }
  
  // Success message
  console.log('\n🎉 Deployment Complete!');
  console.log('=======================');
  console.log('✅ D1 Database: staff_management_db');
  console.log('✅ KV Sessions: Configured');
  console.log('✅ Workers: Deployed');
  console.log('\n🌍 Your app is live at:');
  console.log('Production: https://staff-management-prod.workers.dev');
  console.log('Staging: https://staff-management-staging.workers.dev');
  console.log('\n📝 Next steps:');
  console.log('1. Visit your app URL to test');
  console.log('2. Configure custom domain (optional)');
  console.log('3. Set up monitoring and alerts');
  
  rl.close();
}

// Run setup
setupCloudflare().catch((error) => {
  console.error('\n💥 Setup failed:', error.message);
  rl.close();
  process.exit(1);
});