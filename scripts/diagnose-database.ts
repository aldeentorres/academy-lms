import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function diagnoseDatabase() {
  console.log('🔍 Diagnosing database connection and schema...\n');

  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing database connection...');
    await prisma.$connect();
    console.log('   ✅ Connected successfully\n');

    // Test 2: Check if tables exist
    console.log('2️⃣ Checking if tables exist...');
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;
    
    console.log(`   Found ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`   - ${table.tablename}`);
    });
    console.log('');

    // Test 3: Check expected tables
    const expectedTables = ['User', 'Agent', 'Course', 'Category', 'Country', 'Lesson', 'Quiz', 'Question', 'Assignment', 'Submission'];
    const existingTableNames = tables.map(t => t.tablename);
    const missingTables = expectedTables.filter(t => !existingTableNames.includes(t));
    
    if (missingTables.length > 0) {
      console.log('   ⚠️  Missing tables:');
      missingTables.forEach(table => {
        console.log(`   - ${table}`);
      });
      console.log('');
    } else {
      console.log('   ✅ All expected tables exist\n');
    }

    // Test 4: Test simple query on each table
    console.log('3️⃣ Testing queries on each table...');
    
    const tableTests = [
      { name: 'User', query: () => prisma.user.count() },
      { name: 'Agent', query: () => prisma.agent.count() },
      { name: 'Course', query: () => prisma.course.count() },
      { name: 'Category', query: () => prisma.category.count() },
      { name: 'Country', query: () => prisma.country.count() },
      { name: 'Lesson', query: () => prisma.lesson.count() },
      { name: 'Quiz', query: () => prisma.quiz.count() },
      { name: 'Question', query: () => prisma.question.count() },
      { name: 'Assignment', query: () => prisma.assignment.count() },
      { name: 'Submission', query: () => prisma.submission.count() },
    ];

    for (const test of tableTests) {
      try {
        const count = await test.query();
        console.log(`   ✅ ${test.name}: ${count} records`);
      } catch (error: any) {
        console.log(`   ❌ ${test.name}: ${error.message}`);
      }
    }
    console.log('');

    // Test 5: Check schema vs database
    console.log('4️⃣ Checking schema compatibility...');
    try {
      const result = await prisma.$queryRaw`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'Agent' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;
      console.log(`   ✅ Agent table structure accessible`);
      console.log(`   Columns: ${JSON.stringify(result, null, 2)}`);
    } catch (error: any) {
      console.log(`   ❌ Schema check failed: ${error.message}`);
    }
    console.log('');

    // Test 6: Check database URL info
    const dbUrl = process.env.DATABASE_URL || 'NOT SET';
    const isProduction = dbUrl.includes('vercel') || dbUrl.includes('postgres') || dbUrl.includes('prisma');
    console.log('5️⃣ Database connection info:');
    console.log(`   Type: ${isProduction ? 'Production (PostgreSQL)' : 'Unknown'}`);
    console.log(`   URL: ${dbUrl.substring(0, 50)}...`);
    console.log('');

  } catch (error: any) {
    console.error('\n❌ Diagnostic failed:', error.message);
    console.error('   Error code:', error.code);
    if (error.meta) {
      console.error('   Meta:', JSON.stringify(error.meta, null, 2));
    }
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseDatabase();
