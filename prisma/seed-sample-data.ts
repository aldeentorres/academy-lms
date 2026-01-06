import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding sample data...');

  // Create sample categories
  const category1 = await prisma.category.upsert({
    where: { slug: 'real-estate-basics' },
    update: {},
    create: {
      name: 'Real Estate Basics',
      slug: 'real-estate-basics',
      description: 'Fundamental courses for real estate agents',
    },
  });

  const category2 = await prisma.category.upsert({
    where: { slug: 'sales-techniques' },
    update: {},
    create: {
      name: 'Sales Techniques',
      slug: 'sales-techniques',
      description: 'Advanced sales and negotiation skills',
    },
  });

  // Create sample countries
  const country1 = await prisma.country.upsert({
    where: { code: 'US' },
    update: {},
    create: {
      code: 'US',
      name: 'United States',
    },
  });

  const country2 = await prisma.country.upsert({
    where: { code: 'GB' },
    update: {},
    create: {
      code: 'GB',
      name: 'United Kingdom',
    },
  });

  // Create sample course
  const course = await prisma.course.upsert({
    where: { slug: 'introduction-to-real-estate' },
    update: {},
    create: {
      title: 'Introduction to Real Estate',
      slug: 'introduction-to-real-estate',
      description: 'Learn the fundamentals of real estate, property types, market analysis, and client relations.',
      categoryId: category1.id,
      countryId: country1.id,
      isPublished: true,
    },
  });

  // Create sample lessons
  const lesson1 = await prisma.lesson.create({
    data: {
      courseId: course.id,
      title: 'Understanding Property Types',
      slug: 'understanding-property-types',
      description: 'Learn about different types of properties: residential, commercial, and industrial.',
      order: 1,
      isPublished: true,
      videoUrl: 'https://s3bubble.com/video/example1',
      content: '<p>This lesson covers the various types of properties you will encounter in real estate.</p>',
    },
  });

  const lesson2 = await prisma.lesson.create({
    data: {
      courseId: course.id,
      title: 'Market Analysis Fundamentals',
      slug: 'market-analysis-fundamentals',
      description: 'Master the art of analyzing real estate markets and pricing properties correctly.',
      order: 2,
      isPublished: true,
      videoUrl: 'https://s3bubble.com/video/example2',
      content: '<p>Learn how to analyze market trends and determine property values.</p>',
    },
  });

  const lesson3 = await prisma.lesson.create({
    data: {
      courseId: course.id,
      title: 'Client Communication Skills',
      slug: 'client-communication-skills',
      description: 'Develop effective communication strategies for working with clients.',
      order: 3,
      isPublished: true,
      videoUrl: 'https://s3bubble.com/video/example3',
      content: '<p>Essential communication skills for building strong client relationships.</p>',
    },
  });

  // Create sample quiz for lesson 1
  const quiz1 = await prisma.quiz.create({
    data: {
      lessonId: lesson1.id,
      title: 'Property Types Quiz',
      questions: {
        create: [
          {
            question: 'What is the most common type of residential property?',
            type: 'multiple-choice',
            options: JSON.stringify(['Single-family home', 'Apartment', 'Townhouse', 'Condo']),
            correctAnswer: 'Single-family home',
            points: 10,
            order: 1,
          },
          {
            question: 'Commercial properties are used for business purposes.',
            type: 'true-false',
            correctAnswer: 'true',
            points: 5,
            order: 2,
          },
          {
            question: 'What factors determine property value?',
            type: 'short-answer',
            correctAnswer: 'Location, size, condition, market trends',
            points: 15,
            order: 3,
          },
        ],
      },
    },
  });

  // Create sample quiz for lesson 2
  const quiz2 = await prisma.quiz.create({
    data: {
      lessonId: lesson2.id,
      title: 'Market Analysis Quiz',
      questions: {
        create: [
          {
            question: 'What is a CMA?',
            type: 'multiple-choice',
            options: JSON.stringify(['Comparative Market Analysis', 'Commercial Market Assessment', 'Customer Market Analysis', 'None of the above']),
            correctAnswer: 'Comparative Market Analysis',
            points: 10,
            order: 1,
          },
          {
            question: 'Market trends can be analyzed using historical data.',
            type: 'true-false',
            correctAnswer: 'true',
            points: 5,
            order: 2,
          },
        ],
      },
    },
  });

  // Create sample assignments
  const assignment1 = await prisma.assignment.create({
    data: {
      lessonId: lesson1.id,
      title: 'Property Type Research Assignment',
      description: 'Research and write a 500-word report on three different property types in your local market. Include pricing, features, and target demographics.',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      maxPoints: 100,
    },
  });

  const assignment2 = await prisma.assignment.create({
    data: {
      lessonId: lesson2.id,
      title: 'Market Analysis Project',
      description: 'Conduct a market analysis for a property in your area. Create a report with comparable properties, pricing trends, and recommendations.',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      maxPoints: 150,
    },
  });

  const assignment3 = await prisma.assignment.create({
    data: {
      lessonId: lesson3.id,
      title: 'Client Communication Role Play',
      description: 'Record a 10-minute role-play session demonstrating effective client communication. Submit the recording and a written reflection.',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      maxPoints: 120,
    },
  });

  // Helper function to generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Create sample agent
  const agent = await prisma.agent.upsert({
    where: { email: 'agent@example.com' },
    update: {},
    create: {
      email: 'agent@example.com',
      name: 'John Smith',
      slug: 'john-smith',
      apiId: 'atlas_agent_12345',
    },
  });

  // Create sample submissions
  await prisma.submission.create({
    data: {
      assignmentId: assignment1.id,
      agentId: agent.id,
      content: 'I researched three property types: single-family homes, condos, and townhouses. Single-family homes average $350k, condos $200k, and townhouses $280k in my area.',
      score: 85,
      feedback: 'Good research! Consider adding more details about target demographics.',
    },
  });

  await prisma.submission.create({
    data: {
      assignmentId: assignment2.id,
      agentId: agent.id,
      content: 'Market analysis completed for 123 Main St. Comparable properties show pricing range of $300k-$350k. Recommendation: List at $325k.',
      score: 92,
      feedback: 'Excellent analysis with clear recommendations. Well done!',
    },
  });

  console.log('✅ Sample data seeded successfully!');
  console.log(`   - Course: ${course.title}`);
  console.log(`   - Lessons: 3`);
  console.log(`   - Quizzes: 2`);
  console.log(`   - Assignments: 3`);
  console.log(`   - Agent: ${agent.name}`);
  console.log(`   - Submissions: 2`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
