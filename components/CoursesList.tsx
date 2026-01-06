'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Pagination from './Pagination';

interface Course {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  category: { name: string };
  country: { name: string } | null;
  _count: { lessons: number };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface CoursesListProps {
  courses: Course[];
  pagination: PaginationInfo;
}

export default function CoursesList({ courses, pagination }: CoursesListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/dashboard/courses?${params.toString()}`);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="divide-y divide-gray-200">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        course.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>{course.category.name}</span>
                      {course.country && <span>• {course.country.name}</span>}
                      <span>• {course._count.lessons} lessons</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      href={`/courses/${course.slug}`}
                      className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                      target="_blank"
                    >
                      View
                    </Link>
                    <Link
                      href={`/dashboard/courses/${course.id}/edit`}
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
              <p className="text-gray-500 mb-4">No courses yet.</p>
              <Link
                href="/dashboard/courses/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                Create Your First Course
              </Link>
            </div>
          )}
        </div>
      </div>

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {pagination.total > 0 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} courses
        </div>
      )}
    </>
  );
}
