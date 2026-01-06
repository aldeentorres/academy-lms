import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to generate slug from title
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

async function main() {
  console.log('🌱 Seeding empty data...');

  // Create categories
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
        description: 'Legal requirements and compliance in real estate',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'marketing-strategies' },
      update: {},
      create: {
        name: 'Marketing Strategies',
        slug: 'marketing-strategies',
        description: 'Marketing and promotion strategies for real estate',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'customer-service' },
      update: {},
      create: {
        name: 'Customer Service',
        slug: 'customer-service',
        description: 'Excellent customer service for real estate professionals',
      },
    }),
  ]);

  console.log('✅ Created/updated categories:', categories.length);

  // Create countries (Malaysia is main, then others)
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

  const malaysia = countries[0];
  console.log('✅ Created/updated countries:', countries.map(c => c.name).join(', '));

  // Create 10 courses with different categories and countries
  const courses = await Promise.all([
    // Malaysia courses (main country)
    prisma.course.upsert({
      where: { slug: 'introduction-to-real-estate-malaysia' },
      update: {},
      create: {
        title: 'Introduction to Real Estate - Malaysia',
        slug: 'introduction-to-real-estate-malaysia',
        description: 'Learn the fundamentals of real estate in Malaysia.',
        categoryId: categories[0].id, // Real Estate Basics
        countryId: malaysia.id,
        isPublished: true,
      },
    }),
    prisma.course.upsert({
      where: { slug: 'advanced-sales-techniques-malaysia' },
      update: {},
      create: {
        title: 'Advanced Sales Techniques - Malaysia',
        slug: 'advanced-sales-techniques-malaysia',
        description: 'Master advanced sales and negotiation skills for the Malaysian market.',
        categoryId: categories[1].id, // Sales Techniques
        countryId: malaysia.id,
        isPublished: true,
      },
    }),
    prisma.course.upsert({
      where: { slug: 'property-management-malaysia' },
      update: {},
      create: {
        title: 'Property Management Essentials - Malaysia',
        slug: 'property-management-malaysia',
        description: 'Essential property management skills for Malaysian properties.',
        categoryId: categories[2].id, // Property Management
        countryId: malaysia.id,
        isPublished: true,
      },
    }),
    prisma.course.upsert({
      where: { slug: 'legal-compliance-malaysia' },
      update: {},
      create: {
        title: 'Legal & Compliance in Real Estate - Malaysia',
        slug: 'legal-compliance-malaysia',
        description: 'Understanding legal requirements and compliance in Malaysian real estate.',
        categoryId: categories[3].id, // Legal & Compliance
        countryId: malaysia.id,
        isPublished: true,
      },
    }),
    // Vietnam courses
    prisma.course.upsert({
      where: { slug: 'real-estate-basics-vietnam' },
      update: {},
      create: {
        title: 'Real Estate Basics - Vietnam',
        slug: 'real-estate-basics-vietnam',
        description: 'Fundamental real estate knowledge for the Vietnamese market.',
        categoryId: categories[0].id, // Real Estate Basics
        countryId: countries[1].id, // Vietnam
        isPublished: true,
      },
    }),
    prisma.course.upsert({
      where: { slug: 'marketing-strategies-vietnam' },
      update: {},
      create: {
        title: 'Marketing Strategies for Real Estate - Vietnam',
        slug: 'marketing-strategies-vietnam',
        description: 'Effective marketing strategies for Vietnamese real estate market.',
        categoryId: categories[4].id, // Marketing Strategies
        countryId: countries[1].id, // Vietnam
        isPublished: true,
      },
    }),
    // Canada courses
    prisma.course.upsert({
      where: { slug: 'customer-service-canada' },
      update: {},
      create: {
        title: 'Customer Service Excellence - Canada',
        slug: 'customer-service-canada',
        description: 'Deliver exceptional customer service in the Canadian real estate market.',
        categoryId: categories[5].id, // Customer Service
        countryId: countries[2].id, // Canada
        isPublished: true,
      },
    }),
    // Australia courses
    prisma.course.upsert({
      where: { slug: 'sales-techniques-australia' },
      update: {},
      create: {
        title: 'Sales Techniques for Australian Market',
        slug: 'sales-techniques-australia',
        description: 'Advanced sales techniques tailored for the Australian real estate market.',
        categoryId: categories[1].id, // Sales Techniques
        countryId: countries[3].id, // Australia
        isPublished: true,
      },
    }),
    // Philippines courses
    prisma.course.upsert({
      where: { slug: 'property-management-philippines' },
      update: {},
      create: {
        title: 'Property Management - Philippines',
        slug: 'property-management-philippines',
        description: 'Comprehensive property management for the Philippine market.',
        categoryId: categories[2].id, // Property Management
        countryId: countries[4].id, // Philippines
        isPublished: true,
      },
    }),
    // Another Malaysia course
    prisma.course.upsert({
      where: { slug: 'marketing-malaysia' },
      update: {},
      create: {
        title: 'Real Estate Marketing - Malaysia',
        slug: 'marketing-malaysia',
        description: 'Effective marketing strategies for Malaysian real estate professionals.',
        categoryId: categories[4].id, // Marketing Strategies
        countryId: malaysia.id,
        isPublished: true,
      },
    }),
  ]);

  console.log('✅ Created 10 courses:');
  courses.forEach((course, index) => {
    const country = countries.find(c => c.id === course.countryId)?.name || 'Unknown';
    console.log(`   ${index + 1}. ${course.title} (${country})`);
  });

  // Add some empty lessons, quizzes, and assignments to the courses
  // Add empty lessons to first course
  await prisma.lesson.upsert({
    where: {
      courseId_slug: {
        courseId: courses[0].id,
        slug: 'empty-lesson-1',
      },
    },
    update: {},
    create: {
      courseId: courses[0].id,
      title: 'Empty Lesson 1',
      slug: 'empty-lesson-1',
      description: 'This lesson has no video or content yet.',
      order: 1,
      isPublished: true,
    },
  });

  await prisma.lesson.upsert({
    where: {
      courseId_slug: {
        courseId: courses[0].id,
        slug: 'empty-lesson-2',
      },
    },
    update: {},
    create: {
      courseId: courses[0].id,
      title: 'Empty Lesson 2',
      slug: 'empty-lesson-2',
      order: 2,
      isPublished: true,
    },
  });

  // Add empty standalone quiz to second course
  const existingQuiz1 = await prisma.quiz.findFirst({
    where: {
      courseId: courses[1].id,
      slug: 'empty-quiz-1',
    },
  });
  
  if (!existingQuiz1) {
    await prisma.quiz.create({
      data: {
        courseId: courses[1].id,
        title: 'Empty Quiz 1',
        slug: 'empty-quiz-1',
        description: 'This quiz has no questions yet.',
        order: 1,
        isPublished: true,
      },
    });
  }

  // Add empty standalone assignment to third course
  const existingAssignment1 = await prisma.assignment.findFirst({
    where: {
      courseId: courses[2].id,
      slug: 'empty-assignment-1',
    },
  });
  
  if (!existingAssignment1) {
    await prisma.assignment.create({
      data: {
        courseId: courses[2].id,
        title: 'Empty Assignment 1',
        slug: 'empty-assignment-1',
        description: 'This assignment is ready for content.',
        order: 1,
        maxPoints: 100,
        isPublished: true,
      },
    });
  }

  // Add mixed content to fourth course (lesson, quiz, assignment in sequence)
  await prisma.lesson.upsert({
    where: {
      courseId_slug: {
        courseId: courses[3].id,
        slug: 'empty-lesson-a',
      },
    },
    update: {},
    create: {
      courseId: courses[3].id,
      title: 'Empty Lesson A',
      slug: 'empty-lesson-a',
      order: 1,
      isPublished: true,
    },
  });

  const existingQuizA = await prisma.quiz.findFirst({
    where: {
      courseId: courses[3].id,
      slug: 'empty-quiz-a',
    },
  });
  
  if (!existingQuizA) {
    await prisma.quiz.create({
      data: {
        courseId: courses[3].id,
        title: 'Empty Quiz A',
        slug: 'empty-quiz-a',
        order: 2,
        isPublished: true,
      },
    });
  }

  const existingAssignmentA = await prisma.assignment.findFirst({
    where: {
      courseId: courses[3].id,
      slug: 'empty-assignment-a',
    },
  });
  
  if (!existingAssignmentA) {
    await prisma.assignment.create({
      data: {
        courseId: courses[3].id,
        title: 'Empty Assignment A',
        slug: 'empty-assignment-a',
        description: 'Empty assignment',
        order: 3,
        maxPoints: 100,
        isPublished: true,
      },
    });
  }

  console.log('✅ Added empty lessons, quizzes, and assignments to courses');

  // Create agents with different performance levels
  const agents = await Promise.all([
    prisma.agent.upsert({
      where: { email: 'ahmad.rahman@example.com' },
      update: {},
      create: {
        email: 'ahmad.rahman@example.com',
        name: 'Ahmad Rahman',
        slug: 'ahmad-rahman',
        apiId: 'atlas_agent_001',
      },
    }),
    prisma.agent.upsert({
      where: { email: 'siti.nurhaliza@example.com' },
      update: {},
      create: {
        email: 'siti.nurhaliza@example.com',
        name: 'Siti Nurhaliza',
        slug: 'siti-nurhaliza',
        apiId: 'atlas_agent_002',
      },
    }),
    prisma.agent.upsert({
      where: { email: 'lim.wei.ming@example.com' },
      update: {},
      create: {
        email: 'lim.wei.ming@example.com',
        name: 'Lim Wei Ming',
        slug: 'lim-wei-ming',
        apiId: 'atlas_agent_003',
      },
    }),
    prisma.agent.upsert({
      where: { email: 'tan.su.ling@example.com' },
      update: {},
      create: {
        email: 'tan.su.ling@example.com',
        name: 'Tan Su Ling',
        slug: 'tan-su-ling',
        apiId: 'atlas_agent_004',
      },
    }),
    prisma.agent.upsert({
      where: { email: 'nguyen.van.anh@example.com' },
      update: {},
      create: {
        email: 'nguyen.van.anh@example.com',
        name: 'Nguyen Van Anh',
        slug: 'nguyen-van-anh',
        apiId: 'atlas_agent_005',
      },
    }),
    prisma.agent.upsert({
      where: { email: 'tran.thi.lan@example.com' },
      update: {},
      create: {
        email: 'tran.thi.lan@example.com',
        name: 'Tran Thi Lan',
        slug: 'tran-thi-lan',
        apiId: 'atlas_agent_006',
      },
    }),
    prisma.agent.upsert({
      where: { email: 'john.smith@example.com' },
      update: {},
      create: {
        email: 'john.smith@example.com',
        name: 'John Smith',
        slug: 'john-smith',
        apiId: 'atlas_agent_007',
      },
    }),
    prisma.agent.upsert({
      where: { email: 'sarah.johnson@example.com' },
      update: {},
      create: {
        email: 'sarah.johnson@example.com',
        name: 'Sarah Johnson',
        slug: 'sarah-johnson',
        apiId: 'atlas_agent_008',
      },
    }),
  ]);

  console.log('✅ Created/updated agents:', agents.length);

  // Get assignments to create submissions
  const assignments = await prisma.assignment.findMany({
    take: 5,
  });

  // Create submissions for agents with varying scores (for leaderboard)
  if (assignments.length > 0) {
    // Agent 1: High performer (95-100 scores)
    await prisma.submission.createMany({
      data: [
        {
          assignmentId: assignments[0].id,
          agentId: agents[0].id,
          content: 'Excellent submission with detailed analysis.',
          score: 98,
          feedback: 'Outstanding work! Very thorough analysis.',
        },
        {
          assignmentId: assignments[1]?.id || assignments[0].id,
          agentId: agents[0].id,
          content: 'Comprehensive market research completed.',
          score: 95,
          feedback: 'Great research methodology.',
        },
        {
          assignmentId: assignments[2]?.id || assignments[0].id,
          agentId: agents[0].id,
          content: 'Well-structured property analysis.',
          score: 100,
          feedback: 'Perfect submission!',
        },
      ],
    });

    // Agent 2: Strong performer (85-94 scores)
    await prisma.submission.createMany({
      data: [
        {
          assignmentId: assignments[0].id,
          agentId: agents[1].id,
          content: 'Good submission with solid analysis.',
          score: 88,
          feedback: 'Well done! Minor improvements needed.',
        },
        {
          assignmentId: assignments[1]?.id || assignments[0].id,
          agentId: agents[1].id,
          content: 'Market analysis with good insights.',
          score: 92,
          feedback: 'Excellent insights!',
        },
      ],
    });

    // Agent 3: Good performer (75-84 scores)
    await prisma.submission.createMany({
      data: [
        {
          assignmentId: assignments[0].id,
          agentId: agents[2].id,
          content: 'Decent submission covering key points.',
          score: 80,
          feedback: 'Good effort. Could add more details.',
        },
        {
          assignmentId: assignments[1]?.id || assignments[0].id,
          agentId: agents[2].id,
          content: 'Basic market research completed.',
          score: 78,
          feedback: 'Keep improving!',
        },
      ],
    });

    // Agent 4: Average performer (65-74 scores)
    await prisma.submission.createMany({
      data: [
        {
          assignmentId: assignments[0].id,
          agentId: agents[3].id,
          content: 'Submission with basic information.',
          score: 70,
          feedback: 'Needs more depth in analysis.',
        },
      ],
    });

    // Agent 5: New agent (pending submissions)
    await prisma.submission.createMany({
      data: [
        {
          assignmentId: assignments[0].id,
          agentId: agents[4].id,
          content: 'New submission awaiting review.',
          score: null,
        },
      ],
    });

    // Agent 6: Mixed performance
    await prisma.submission.createMany({
      data: [
        {
          assignmentId: assignments[0].id,
          agentId: agents[5].id,
          content: 'Good submission.',
          score: 85,
          feedback: 'Nice work!',
        },
        {
          assignmentId: assignments[1]?.id || assignments[0].id,
          agentId: agents[5].id,
          content: 'Another submission.',
          score: 82,
        },
      ],
    });

    // Agent 7: High performer (90+ scores)
    await prisma.submission.createMany({
      data: [
        {
          assignmentId: assignments[0].id,
          agentId: agents[6].id,
          content: 'Excellent detailed analysis.',
          score: 96,
          feedback: 'Outstanding quality!',
        },
        {
          assignmentId: assignments[1]?.id || assignments[0].id,
          agentId: agents[6].id,
          content: 'Comprehensive research.',
          score: 94,
          feedback: 'Very thorough!',
        },
        {
          assignmentId: assignments[2]?.id || assignments[0].id,
          agentId: agents[6].id,
          content: 'Well-structured analysis.',
          score: 91,
        },
      ],
    });

    // Agent 8: Strong performer
    await prisma.submission.createMany({
      data: [
        {
          assignmentId: assignments[0].id,
          agentId: agents[7].id,
          content: 'Good submission.',
          score: 87,
          feedback: 'Well done!',
        },
        {
          assignmentId: assignments[1]?.id || assignments[0].id,
          agentId: agents[7].id,
          content: 'Market analysis completed.',
          score: 89,
        },
      ],
    });

    console.log('✅ Created submissions for agents with varying scores');
  }

  console.log('');
  console.log('✅ Empty data seeded successfully!');
  console.log('');
  console.log('Summary:');
  console.log(`  - ${categories.length} categories created/updated`);
  console.log(`  - ${countries.length} countries created/updated (Malaysia, Vietnam, Canada, Australia, Philippines)`);
  console.log(`  - ${courses.length} courses created with different categories and countries`);
  console.log(`  - ${agents.length} agents created with submissions`);
  console.log('  - Added empty lessons, quizzes, and assignments to various courses');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding empty data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
