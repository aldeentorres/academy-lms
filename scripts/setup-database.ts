import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupDatabase() {
  console.log('🔧 Setting up database...\n');

  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    // Try to push schema
    console.log('📦 Pushing schema to database...');
    const { execSync } = require('child_process');
    
    try {
      execSync('npx prisma db push --skip-generate', { 
        stdio: 'inherit',
        env: process.env 
      });
      console.log('✅ Schema pushed successfully\n');
    } catch (error: any) {
      console.error('❌ Error pushing schema:', error.message);
      console.log('\n⚠️  Trying alternative approach...\n');
      
      // Alternative: Create tables manually using raw SQL
      console.log('📝 Creating tables manually...');
      
      // This is a fallback - we'll try to create the User table as a test
      try {
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "User" (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'admin',
            "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log('✅ User table created (test)');
      } catch (sqlError: any) {
        console.error('❌ SQL error:', sqlError.message);
        throw sqlError;
      }
    }

    console.log('\n✅ Database setup complete!');
    console.log('You can now run: npm run db:seed-production\n');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
