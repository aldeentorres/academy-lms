import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugCourses() {
  console.log('🔍 Debugging courses query...\n');

  try {
    // Test 1: Check total courses
    const totalCourses = await prisma.course.count();
    console.log(`📊 Total courses in database: ${totalCourses}`);

    // Test 2: Check published courses
    const publishedCourses = await prisma.course.count({
      where: { isPublished: true },
    });
    console.log(`✅ Published courses: ${publishedCourses}`);

    // Test 3: Check unpublished courses
    const unpublishedCourses = await prisma.course.count({
      where: { isPublished: false },
    });
    console.log(`❌ Unpublished courses: ${unpublishedCourses}\n`);

    // Test 4: Try the exact query from home page
    console.log('🔎 Testing home page query...');
    try {
      const courses = await prisma.course.findMany({
        where: { isPublished: true },
        include: {
          category: true,
          country: true,
          _count: {
            select: { lessons: true },
          },
        },
        take: 6,
        orderBy: { createdAt: 'desc' },
      });
      console.log(`✅ Query successful! Found ${courses.length} courses\n`);

      if (courses.length > 0) {
        console.log('📚 Sample course:');
        const course = courses[0];
        console.log(`   Title: ${course.title}`);
        console.log(`   Published: ${course.isPublished}`);
        console.log(`   Category: ${course.category?.name || 'MISSING'}`);
        console.log(`   Country: ${course.country?.name || 'MISSING'}`);
        console.log(`   Lessons: ${course._count.lessons}`);
      } else {
        console.log('⚠️  No courses returned, but query succeeded\n');
        
        // Check if courses exist but have issues
        const allCourses = await prisma.course.findMany({
          take: 3,
        });
        
        if (allCourses.length > 0) {
          console.log('🔍 Checking first course details:');
          const course = allCourses[0];
          console.log(`   ID: ${course.id}`);
          console.log(`   Title: ${course.title}`);
          console.log(`   Published: ${course.isPublished}`);
          console.log(`   Category ID: ${course.categoryId}`);
          console.log(`   Country ID: ${course.countryId || 'null'}`);
          
          // Check if category exists
          if (course.categoryId) {
            const category = await prisma.category.findUnique({
              where: { id: course.categoryId },
            });
            console.log(`   Category exists: ${category ? 'YES' : 'NO'}`);
          }
          
          // Check if country exists
          if (course.countryId) {
            const country = await prisma.country.findUnique({
              where: { id: course.countryId },
            });
            console.log(`   Country exists: ${country ? 'YES' : 'NO'}`);
          }
        }
      }
    } catch (queryError: any) {
      console.error('❌ Query failed:', queryError.message);
      console.error('   Error code:', queryError.code);
    }

    // Test 5: Check categories and countries
    console.log('\n📋 Checking relations:');
    const categories = await prisma.category.count();
    const countries = await prisma.country.count();
    console.log(`   Categories: ${categories}`);
    console.log(`   Countries: ${countries}`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
  } finally {
    await prisma.$disconnect();
  }
}

debugCourses();
