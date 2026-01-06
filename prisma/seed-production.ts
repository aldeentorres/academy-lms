import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper function to generate slug from name/title
const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

async function main() {
  console.log('🚀 Starting production seed...');
  console.log('This will create:');
  console.log('  - Admin user');
  console.log('  - Categories');
  console.log('  - Countries');
  console.log('  - Courses with lessons, quizzes, assignments');
  console.log('  - Agents with submissions');
  console.log('');

  // ============================================
  // 1. CREATE ADMIN USER
  // ============================================
  console.log('📝 Creating admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'admin',
    },
  });
  console.log('✅ Admin created:', admin.email);
  console.log('   Password: admin123');
  console.log('   ⚠️  CHANGE THIS PASSWORD AFTER FIRST LOGIN!');
  console.log('');

  // ============================================
  // 2. CREATE CATEGORIES
  // ============================================
  console.log('📚 Creating categories...');
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'real-estate-basics' },
      update: {},
      create: {
        name: 'Real Estate Basics',
        slug: 'real-estate-basics',
        description: 'Fundamental courses for real estate agents',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'sales-techniques' },
      update: {},
      create: {
        name: 'Sales Techniques',
        slug: 'sales-techniques',
        description: 'Advanced sales and negotiation skills',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'property-management' },
      update: {},
      create: {
        name: 'Property Management',
        slug: 'property-management',
        description: 'Learn how to manage properties effectively',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'legal-compliance' },
      update: {},
      create: {
        name: 'Legal & Compliance',
        slug: 'legal-compliance',
        description: 'Legal requirements and compliance training',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'technology' },
      update: {},
      create: {
        name: 'Technology',
        slug: 'technology',
        description: 'Technology and tools for real estate',
      },
    }),
  ]);
  console.log(`✅ Created ${categories.length} categories`);
  console.log('');

  // ============================================
  // 3. CREATE COUNTRIES
  // ============================================
  console.log('🌍 Creating countries...');
  const countries = await Promise.all([
    prisma.country.upsert({
      where: { code: 'MY' },
      update: {},
      create: {
        code: 'MY',
        name: 'Malaysia',
      },
    }),
    prisma.country.upsert({
      where: { code: 'VN' },
      update: {},
      create: {
        code: 'VN',
        name: 'Vietnam',
      },
    }),
    prisma.country.upsert({
      where: { code: 'CA' },
      update: {},
      create: {
        code: 'CA',
        name: 'Canada',
      },
    }),
    prisma.country.upsert({
      where: { code: 'AU' },
      update: {},
      create: {
        code: 'AU',
        name: 'Australia',
      },
    }),
    prisma.country.upsert({
      where: { code: 'PH' },
      update: {},
      create: {
        code: 'PH',
        name: 'Philippines',
      },
    }),
  ]);
  console.log(`✅ Created ${countries.length} countries`);
  console.log('');

  // ============================================
  // 4. CREATE COURSES WITH CONTENT
  // ============================================
  console.log('📖 Creating courses...');

  // Course 1: Real Estate Fundamentals (Malaysia)
  const course1 = await prisma.course.upsert({
    where: { slug: 'real-estate-fundamentals-malaysia' },
    update: {},
    create: {
      title: 'Real Estate Fundamentals - Malaysia',
      slug: 'real-estate-fundamentals-malaysia',
      description: 'Learn the fundamentals of real estate in Malaysia',
      categoryId: categories[0].id,
      countryId: countries[0].id, // Malaysia
      isPublished: true,
    },
  });

  // Add lessons to course 1
  const lesson1 = await prisma.lesson.create({
    data: {
      courseId: course1.id,
      title: 'Introduction to Real Estate',
      slug: 'introduction-to-real-estate',
      description: 'Understanding the basics of real estate',
      order: 1,
      isPublished: true,
    },
  });

  const lesson2 = await prisma.lesson.create({
    data: {
      courseId: course1.id,
      title: 'Property Types',
      slug: 'property-types',
      description: 'Different types of properties',
      order: 2,
      isPublished: true,
    },
  });

  // Add quiz to lesson 1
  await prisma.quiz.create({
    data: {
      courseId: course1.id,
      lessonId: lesson1.id,
      title: 'Real Estate Basics Quiz',
      slug: 'real-estate-basics-quiz',
      order: 1,
      questions: {
        create: [
          {
            question: 'What is real estate?',
            type: 'multiple-choice',
            options: JSON.stringify(['Property and land', 'Only buildings', 'Only land', 'None of the above']),
            correctAnswer: 'Property and land',
            points: 10,
            order: 1,
          },
        ],
      },
    },
  });

  // Course 2: Sales Mastery (Vietnam)
  const course2 = await prisma.course.upsert({
    where: { slug: 'sales-mastery-vietnam' },
    update: {},
    create: {
      title: 'Sales Mastery - Vietnam',
      slug: 'sales-mastery-vietnam',
      description: 'Master sales techniques for the Vietnamese market',
      categoryId: categories[1].id,
      countryId: countries[1].id, // Vietnam
      isPublished: true,
    },
  });

  // Course 3: Property Management (Canada)
  const course3 = await prisma.course.upsert({
    where: { slug: 'property-management-canada' },
    update: {},
    create: {
      title: 'Property Management - Canada',
      slug: 'property-management-canada',
      description: 'Learn property management in Canada',
      categoryId: categories[2].id,
      countryId: countries[2].id, // Canada
      isPublished: true,
    },
  });

  // Course 4: Legal Compliance (Australia)
  const course4 = await prisma.course.upsert({
    where: { slug: 'legal-compliance-australia' },
    update: {},
    create: {
      title: 'Legal Compliance - Australia',
      slug: 'legal-compliance-australia',
      description: 'Understanding legal requirements in Australia',
      categoryId: categories[3].id,
      countryId: countries[3].id, // Australia
      isPublished: true,
    },
  });

  // Course 5: Tech Tools (Philippines)
  const course5 = await prisma.course.upsert({
    where: { slug: 'tech-tools-philippines' },
    update: {},
    create: {
      title: 'Tech Tools for Real Estate - Philippines',
      slug: 'tech-tools-philippines',
      description: 'Modern technology tools for real estate agents',
      categoryId: categories[4].id,
      countryId: countries[4].id, // Philippines
      isPublished: true,
    },
  });

  // Add more courses (6-10) with different combinations
  const course6 = await prisma.course.upsert({
    where: { slug: 'advanced-sales-malaysia' },
    update: {},
    create: {
      title: 'Advanced Sales Techniques - Malaysia',
      slug: 'advanced-sales-malaysia',
      description: 'Advanced sales strategies for Malaysian market',
      categoryId: categories[1].id,
      countryId: countries[0].id,
      isPublished: true,
    },
  });

  const course7 = await prisma.course.upsert({
    where: { slug: 'property-investment-vietnam' },
    update: {},
    create: {
      title: 'Property Investment - Vietnam',
      slug: 'property-investment-vietnam',
      description: 'Learn property investment in Vietnam',
      categoryId: categories[0].id,
      countryId: countries[1].id,
      isPublished: true,
    },
  });

  const course8 = await prisma.course.upsert({
    where: { slug: 'real-estate-marketing-canada' },
    update: {},
    create: {
      title: 'Real Estate Marketing - Canada',
      slug: 'real-estate-marketing-canada',
      description: 'Marketing strategies for Canadian real estate',
      categoryId: categories[1].id,
      countryId: countries[2].id,
      isPublished: true,
    },
  });

  const course9 = await prisma.course.upsert({
    where: { slug: 'contract-negotiation-australia' },
    update: {},
    create: {
      title: 'Contract Negotiation - Australia',
      slug: 'contract-negotiation-australia',
      description: 'Master contract negotiation in Australia',
      categoryId: categories[3].id,
      countryId: countries[3].id,
      isPublished: true,
    },
  });

  const course10 = await prisma.course.upsert({
    where: { slug: 'digital-marketing-philippines' },
    update: {},
    create: {
      title: 'Digital Marketing for Real Estate - Philippines',
      slug: 'digital-marketing-philippines',
      description: 'Digital marketing strategies for Philippine market',
      categoryId: categories[4].id,
      countryId: countries[4].id,
      isPublished: true,
    },
  });

  console.log('✅ Created 10 courses');
  console.log('');

  // ============================================
  // 5. CREATE AGENTS
  // ============================================
  console.log('👥 Creating agents...');
  const agentNames = [
    { name: 'John Smith', email: 'john.smith@example.com' },
    { name: 'Sarah Johnson', email: 'sarah.johnson@example.com' },
    { name: 'Michael Chen', email: 'michael.chen@example.com' },
    { name: 'Emily Davis', email: 'emily.davis@example.com' },
    { name: 'David Wilson', email: 'david.wilson@example.com' },
    { name: 'Lisa Anderson', email: 'lisa.anderson@example.com' },
    { name: 'Robert Taylor', email: 'robert.taylor@example.com' },
    { name: 'Jennifer Brown', email: 'jennifer.brown@example.com' },
  ];

  const agents = await Promise.all(
    agentNames.map(async (agentData) => {
      const slug = generateSlug(agentData.name);
      const hashedPassword = await bcrypt.hash('agent123', 10);
      return prisma.agent.upsert({
        where: { email: agentData.email },
        update: {},
        create: {
          email: agentData.email,
          name: agentData.name,
          slug: slug,
          password: hashedPassword,
        },
      });
    })
  );

  console.log(`✅ Created ${agents.length} agents`);
  console.log('   Default password for all agents: agent123');
  console.log('');

  // ============================================
  // 6. CREATE AGENT SUBMISSIONS
  // ============================================
  console.log('📝 Creating agent submissions...');

  // Create some assignments first
  const assignment1 = await prisma.assignment.create({
    data: {
      courseId: course1.id,
      lessonId: lesson2.id,
      title: 'Property Analysis Assignment',
      slug: 'property-analysis-assignment',
      description: 'Analyze a property and provide a detailed report',
      maxPoints: 100,
      order: 1,
      isPublished: true,
    },
  });

  // Create submissions for different agents
  const submissions = [
    {
      agentId: agents[0].id,
      assignmentId: assignment1.id,
      score: 95,
      submittedAt: new Date(),
    },
    {
      agentId: agents[1].id,
      assignmentId: assignment1.id,
      score: 88,
      submittedAt: new Date(),
    },
    {
      agentId: agents[2].id,
      assignmentId: assignment1.id,
      score: 92,
      submittedAt: new Date(),
    },
    {
      agentId: agents[3].id,
      assignmentId: assignment1.id,
      score: 85,
      submittedAt: new Date(),
    },
    {
      agentId: agents[4].id,
      assignmentId: assignment1.id,
      score: 90,
      submittedAt: new Date(),
    },
  ];

  await Promise.all(
    submissions.map((submission) =>
      prisma.submission.create({
        data: submission,
      })
    )
  );

  console.log(`✅ Created ${submissions.length} submissions`);
  console.log('');

  // ============================================
  // SUMMARY
  // ============================================
  console.log('🎉 Production seed completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   ✅ Admin user: ${admin.email}`);
  console.log(`   ✅ Categories: ${categories.length}`);
  console.log(`   ✅ Countries: ${countries.length}`);
  console.log(`   ✅ Courses: 10`);
  console.log(`   ✅ Agents: ${agents.length}`);
  console.log(`   ✅ Submissions: ${submissions.length}`);
  console.log('');
  console.log('🔐 Login Credentials:');
  console.log('   Admin:');
  console.log('     Email: admin@example.com');
  console.log('     Password: admin123');
  console.log('   Agents:');
  console.log('     Email: [agent-email]@example.com');
  console.log('     Password: agent123');
  console.log('');
  console.log('⚠️  IMPORTANT: Change all default passwords after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
