import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Countries
  const countries = await Promise.all([
    prisma.country.upsert({
      where: { code: 'US' },
      update: {},
      create: {
        code: 'US',
        name: 'United States',
      },
    }),
    prisma.country.upsert({
      where: { code: 'GB' },
      update: {},
      create: {
        code: 'GB',
        name: 'United Kingdom',
      },
    }),
    prisma.country.upsert({
      where: { code: 'IN' },
      update: {},
      create: {
        code: 'IN',
        name: 'India',
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
  ]);

  console.log('Created countries:', countries.length);

  // Create Categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'technology' },
      update: {},
      create: {
        name: 'Technology',
        slug: 'technology',
        description: 'Courses about technology and programming',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'business' },
      update: {},
      create: {
        name: 'Business',
        slug: 'business',
        description: 'Business and entrepreneurship courses',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'design' },
      update: {},
      create: {
        name: 'Design',
        slug: 'design',
        description: 'Design and creative courses',
      },
    }),
  ]);

  console.log('Created categories:', categories.length);

  // Create a sample course
  const course = await prisma.course.upsert({
    where: { slug: 'introduction-to-web-development' },
    update: {},
    create: {
      title: 'Introduction to Web Development',
      slug: 'introduction-to-web-development',
      description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript.',
      categoryId: categories[0].id,
      countryId: countries[0].id, // US
      isPublished: true,
      lessons: {
        create: [
          {
            title: 'Getting Started with HTML',
            slug: 'getting-started-with-html',
            description: 'Learn the basics of HTML structure and tags.',
            order: 1,
            videoUrl: 'https://example.s3bubble.com/video1', // Replace with actual S3Bubble URL
            content: '<p>HTML is the foundation of web development...</p>',
            isPublished: true,
            quiz: {
              create: {
                title: 'HTML Basics Quiz',
                questions: {
                  create: [
                    {
                      question: 'What does HTML stand for?',
                      type: 'multiple-choice',
                      options: JSON.stringify([
                        'HyperText Markup Language',
                        'High Tech Modern Language',
                        'Home Tool Markup Language',
                      ]),
                      correctAnswer: 'HyperText Markup Language',
                      points: 5,
                      order: 1,
                    },
                    {
                      question: 'HTML is a programming language.',
                      type: 'true-false',
                      correctAnswer: 'False',
                      points: 3,
                      order: 2,
                    },
                  ],
                },
              },
            },
          },
          {
            title: 'CSS Styling Fundamentals',
            slug: 'css-styling-fundamentals',
            description: 'Master CSS to style your web pages beautifully.',
            order: 2,
            videoUrl: 'https://example.s3bubble.com/video2', // Replace with actual S3Bubble URL
            content: '<p>CSS allows you to style your HTML elements...</p>',
            isPublished: true,
            assignment: {
              create: {
                title: 'Create a Styled Web Page',
                description: 'Create a simple web page using HTML and CSS. Include at least 3 different styled elements.',
                maxPoints: 100,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
              },
            },
          },
        ],
      },
    },
  });

  console.log('Created course:', course.title);

  // Create another course for a different country
  const course2 = await prisma.course.upsert({
    where: { slug: 'business-fundamentals-uk' },
    update: {},
    create: {
      title: 'Business Fundamentals (UK Edition)',
      slug: 'business-fundamentals-uk',
      description: 'Learn business fundamentals tailored for the UK market.',
      categoryId: categories[1].id,
      countryId: countries[1].id, // UK
      isPublished: true,
      lessons: {
        create: [
          {
            title: 'UK Business Regulations',
            slug: 'uk-business-regulations',
            description: 'Understanding business regulations in the UK.',
            order: 1,
            videoUrl: 'https://example.s3bubble.com/video3', // Replace with actual S3Bubble URL
            isPublished: true,
          },
        ],
      },
    },
  });

  console.log('Created course:', course2.title);

  // Create a global course (no country restriction)
  const globalCourse = await prisma.course.upsert({
    where: { slug: 'design-principles' },
    update: {},
    create: {
      title: 'Design Principles',
      slug: 'design-principles',
      description: 'Universal design principles that apply everywhere.',
      categoryId: categories[2].id,
      countryId: null, // Available in all countries
      isPublished: true,
      lessons: {
        create: [
          {
            title: 'Color Theory',
            slug: 'color-theory',
            description: 'Learn about color theory and its applications.',
            order: 1,
            videoUrl: 'https://example.s3bubble.com/video4', // Replace with actual S3Bubble URL
            isPublished: true,
          },
        ],
      },
    },
  });

  console.log('Created global course:', globalCourse.title);

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
