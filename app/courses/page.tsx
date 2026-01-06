import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import CourseFilters from '@/components/CourseFilters';
import CourseSearch from '@/components/CourseSearch';

async function getCourses(countryCode?: string, categorySlugs?: string[], search?: string) {
  try {
    const where: any = {
      isPublished: true,
    };

    if (countryCode && countryCode !== 'all') {
      where.country = { code: countryCode };
    }

    // Handle multiple category filters
    if (categorySlugs && categorySlugs.length > 0) {
      where.category = {
        slug: {
          in: categorySlugs,
        },
      };
    }

    // Add search functionality
    if (search) {
      // SQLite doesn't support mode: 'insensitive', so we use contains
      // For PostgreSQL, you can add mode: 'insensitive'
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        {
          lessons: {
            some: {
              OR: [
                { title: { contains: search } },
                { description: { contains: search } },
              ],
            },
          },
        },
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        category: true,
        country: true,
        _count: {
          select: { lessons: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return courses;
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

async function getCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    return [];
  }
}

async function getCountries() {
  try {
    return await prisma.country.findMany({
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    return [];
  }
}

async function CourseList({ 
  countryCode, 
  categorySlugs,
  search
}: { 
  countryCode?: string; 
  categorySlugs?: string[];
  search?: string;
}) {
  const courses = await getCourses(countryCode, categorySlugs, search);

  if (courses.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl shadow-lg p-12 border-2 border-dashed border-gray-200">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No courses found</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          We couldn't find any courses matching your search criteria. Try adjusting your filters or search terms.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/courses"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg inline-block text-center"
          >
            Clear Filters
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <Link
          key={course.id}
          href={`/courses/${course.slug}`}
          className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200 flex flex-col"
        >
          {/* Course Image */}
          {course.thumbnail ? (
            <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden relative">
              <img 
                src={course.thumbnail} 
                alt={course.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          ) : (
            <div className="h-48 bg-primary-500 flex items-center justify-center relative">
              <svg className="w-20 h-20 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
          
          {/* Course Content */}
          <div className="p-6 flex flex-col">
            {/* Category and Country Pills */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold shadow-sm">
                {course.category.name}
              </span>
              {course.country && (
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {course.country.name}
                </span>
              )}
            </div>

            {/* Course Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-primary-600 transition-colors">
              {course.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
              {course.description || 'No description available'}
            </p>

            {/* Footer Info - Justified between */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center text-sm text-gray-600 font-medium">
                <svg className="w-4 h-4 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>{course._count.lessons} {course._count.lessons === 1 ? 'lesson' : 'lessons'}</span>
              </div>
              <div className="text-primary-600 group-hover:text-primary-700 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; categories?: string; search?: string }>;
}) {
  // In Next.js 15+, searchParams is a Promise
  const params = await searchParams;
  const countryCode = params?.country;
  const categoryParam = params?.categories || '';
  const categorySlugs = categoryParam ? categoryParam.split(',').filter(Boolean) : undefined;
  const search = params?.search;
  
  const [categories, countries, totalCourses] = await Promise.all([
    getCategories(),
    getCountries(),
    prisma.course.count({ where: { isPublished: true } })
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Explore Courses</h1>
              <p className="text-lg text-gray-600">
                Discover {totalCourses} {totalCourses === 1 ? 'course' : 'courses'} to enhance your skills
              </p>
            </div>
          </div>

          {/* Search and Filters in One Row */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-8 border border-gray-100">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              {/* Search */}
              <CourseSearch />
              
              {/* Filters */}
              <Suspense fallback={
                <div className="flex gap-3 animate-pulse">
                  <div className="h-12 bg-gray-200 rounded-xl w-48"></div>
                  <div className="h-12 bg-gray-200 rounded-xl flex-1"></div>
                </div>
              }>
                <CourseFilters countries={countries} categories={categories} />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Course List */}
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        }>
          <CourseList 
            countryCode={countryCode} 
            categorySlugs={categorySlugs} 
            search={search}
          />
        </Suspense>
      </div>
    </div>
  );
}
