import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import CoursesList from '@/components/CoursesList';

export const dynamic = 'force-dynamic';

async function getCourses(page: number = 1, limit: number = 20) {
  try {
    const skip = (page - 1) * limit;
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        include: {
          category: true,
          country: true,
          _count: {
            select: { lessons: true }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.course.count(),
    ]);

    return {
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching courses:', error);
    return {
      courses: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params?.page || '1');
  const { courses, pagination } = await getCourses(page, 20);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Courses</h1>
            <p className="mt-2 text-gray-600">Manage all your courses</p>
          </div>
          <Link
            href="/dashboard/courses/new"
            className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
          >
            + New Course
          </Link>
        </div>

        <CoursesList courses={courses} pagination={pagination} />
      </div>
    </div>
  );
}
