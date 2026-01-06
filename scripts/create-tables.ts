import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTables() {
  console.log('🔧 Creating database tables...\n');

  try {
    // Test connection first
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    // Use Prisma's db push via exec
    const { execSync } = require('child_process');
    const { readFileSync } = require('fs');
    const path = require('path');
    
    // Load .env file
    const envPath = path.join(process.cwd(), '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    const envVars: Record<string, string> = {};
    
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)="?([^"]+)"?$/);
      if (match) {
        envVars[match[1].trim()] = match[2].trim();
      }
    });

    console.log('📦 Pushing schema to database...');
    execSync('npx prisma db push --skip-generate', { 
      stdio: 'inherit',
      env: { ...process.env, ...envVars }
    });
    
    console.log('\n✅ Tables created successfully!');
    console.log('You can now run: npm run db:seed-production\n');

  } catch (error: any) {
    if (error.message?.includes('P1001') || error.message?.includes("Can't reach database")) {
      console.error('\n❌ Cannot connect to database server.');
      console.error('Please check:');
      console.error('  1. Your internet connection');
      console.error('  2. The DATABASE_URL in .env file');
      console.error('  3. Try again in a few moments\n');
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTables();
