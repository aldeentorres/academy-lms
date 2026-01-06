import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying production database...\n');

  try {
    // Check admin
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
    });
    console.log('✅ Admin:', admin ? `Found (${admin.email})` : '❌ NOT FOUND');

    // Check categories
    const categories = await prisma.category.findMany();
    console.log(`✅ Categories: ${categories.length} found`);
    if (categories.length > 0) {
      console.log('   ', categories.map(c => c.name).join(', '));
    }

    // Check countries
    const countries = await prisma.country.findMany();
    console.log(`✅ Countries: ${countries.length} found`);
    if (countries.length > 0) {
      console.log('   ', countries.map(c => c.name).join(', '));
    }

    // Check courses
    const allCourses = await prisma.course.findMany();
    const publishedCourses = await prisma.course.findMany({
      where: { isPublished: true },
    });
    console.log(`\n📚 Courses:`);
    console.log(`   Total: ${allCourses.length}`);
    console.log(`   Published: ${publishedCourses.length}`);
    console.log(`   Unpublished: ${allCourses.length - publishedCourses.length}`);

    if (allCourses.length > 0) {
      console.log('\n   Course List:');
      allCourses.forEach(course => {
        const status = course.isPublished ? '✅ Published' : '❌ Unpublished';
        console.log(`   - ${course.title} (${status})`);
      });
    } else {
      console.log('   ❌ NO COURSES FOUND');
    }

    // Check agents
    const agents = await prisma.agent.findMany();
    console.log(`\n👥 Agents: ${agents.length} found`);

    // Check submissions
    const submissions = await prisma.submission.findMany();
    console.log(`📝 Submissions: ${submissions.length} found`);

    // Database URL info
    const dbUrl = process.env.DATABASE_URL || 'NOT SET';
    const isProduction = dbUrl.includes('vercel') || dbUrl.includes('postgres') || dbUrl.includes('supabase');
    console.log(`\n🗄️  Database:`);
    console.log(`   URL: ${isProduction ? '✅ Production (PostgreSQL)' : '⚠️  ' + dbUrl.substring(0, 50) + '...'}`);
    console.log(`   Type: ${isProduction ? 'PostgreSQL' : 'Unknown'}`);

    if (publishedCourses.length === 0 && allCourses.length > 0) {
      console.log('\n⚠️  WARNING: Courses exist but are NOT published!');
      console.log('   They won\'t show on the public /courses page.');
      console.log('   Fix: Update courses to set isPublished = true');
    }

    if (allCourses.length === 0) {
      console.log('\n❌ NO COURSES FOUND IN DATABASE');
      console.log('   Run: npm run db:seed-production');
      console.log('   Make sure DATABASE_URL is set to production!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
