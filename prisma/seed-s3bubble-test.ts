import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating S3Bubble test course...');

  // Get or create a category
  let category = await prisma.category.findFirst({
    where: { slug: 'technology' },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Technology',
        slug: 'technology',
        description: 'Technology courses',
      },
    });
  }

  // Create test course
  const course = await prisma.course.upsert({
    where: { slug: 's3bubble-video-test' },
    update: {},
    create: {
      title: 'S3Bubble Video Test Course',
      slug: 's3bubble-video-test',
      description: 'Test course for S3Bubble video integration. Replace the video URL with your actual S3Bubble embed URL.',
      categoryId: category.id,
      isPublished: true,
      lessons: {
        create: [
          {
            title: 'S3Bubble Video Test Lesson',
            slug: 's3bubble-video-test-lesson',
            description: 'This lesson contains a test S3Bubble video. Replace the videoUrl with your actual S3Bubble embed URL.',
            order: 1,
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Replace with your S3Bubble URL
            content: '<p>This is a test lesson for S3Bubble video integration.</p><p><strong>To test with S3Bubble:</strong></p><ol><li>Get your S3Bubble embed URL</li><li>Update the videoUrl in this lesson via Prisma Studio or dashboard</li><li>View the course to see the video</li></ol>',
            isPublished: true,
          },
        ],
      },
    },
    include: {
      lessons: true,
    },
  });

  console.log('✅ Test course created!');
  console.log('');
  console.log('Course URL: http://localhost:3000/courses/s3bubble-video-test');
  console.log('');
  console.log('To add your S3Bubble video:');
  console.log('1. Open Prisma Studio: npm run db:studio');
  console.log('2. Go to Lesson table');
  console.log('3. Find "S3Bubble Video Test Lesson"');
  console.log('4. Update videoUrl with your S3Bubble embed URL');
  console.log('5. Save and view the course');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
