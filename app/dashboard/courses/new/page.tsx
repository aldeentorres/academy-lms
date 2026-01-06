import CourseForm from '@/components/CourseForm';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getFormData() {
  try {
    const [categories, countries] = await Promise.all([
      prisma.category.findMany({ orderBy: { name: 'asc' } }),
      prisma.country.findMany({ orderBy: { name: 'asc' } }),
    ]);

    return { categories, countries };
  } catch (error) {
    console.error('Error fetching form data:', error);
    // Return empty arrays if database is not available
    return { categories: [], countries: [] };
  }
}

export default async function NewCoursePage() {
  const { categories, countries } = await getFormData();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
          <p className="mt-2 text-gray-600">Fill in the details to create a new course</p>
        </div>

        <CourseForm categories={categories} countries={countries} />
      </div>
    </div>
  );
}
