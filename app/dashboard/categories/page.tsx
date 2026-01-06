import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';

async function getCategories() {
  try {
    return await prisma.category.findMany({
      include: {
        _count: {
          select: { courses: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function CategoriesPage() {
  // Require admin access
  try {
    await requireAdmin();
  } catch (error) {
    redirect('/login?error=unauthorized');
  }

  const categories = await getCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="mt-2 text-gray-600">Manage course categories</p>
          </div>
          <Link
            href="/dashboard/categories/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Category
          </Link>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">All Categories</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div key={category.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                    {category.description && (
                      <p className="mt-1 text-sm text-gray-500">{category.description}</p>
                    )}
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        {category._count.courses} courses
                      </span>
                      <span className="text-xs text-gray-400">Slug: {category.slug}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      href={`/dashboard/categories/${category.id}/edit`}
                      className="px-3 py-1 text-sm text-primary-700 bg-primary-100 rounded hover:bg-primary-200"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <p className="mt-4 text-gray-500 mb-4">No categories yet. Create your first category!</p>
              <Link
                href="/dashboard/categories/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                Create Category
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
