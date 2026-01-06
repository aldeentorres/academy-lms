import CourseForm from '@/components/CourseForm';
import LessonManager from '@/components/LessonManager';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

async function getCourse(id: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        category: true,
        country: true,
        lessons: {
          orderBy: { order: 'asc' },
          include: {
            quiz: {
              include: {
                questions: true,
              },
            },
            assignment: true,
          },
        },
      },
    });
    return course;
  } catch (error) {
    return null;
  }
}

async function getFormData() {
  const [categories, countries] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.country.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return { categories, countries };
}

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [course, { categories, countries }] = await Promise.all([
    getCourse(id),
    getFormData(),
  ]);

  if (!course) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
          <p className="mt-2 text-gray-600">Update course details and manage lessons</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Form */}
          <div className="lg:col-span-1">
            <CourseForm
              course={{
                id: course.id,
                title: course.title,
                slug: course.slug,
                description: course.description || undefined,
                thumbnail: course.thumbnail || undefined,
                categoryId: course.categoryId,
                countryId: course.countryId || undefined,
                isPublished: course.isPublished,
              }}
              categories={categories}
              countries={countries}
            />
          </div>

          {/* Lessons Manager */}
          <div className="lg:col-span-2">
            <LessonManager courseId={course.id} courseSlug={course.slug} lessons={course.lessons} />
          </div>
        </div>
      </div>
    </div>
  );
}
