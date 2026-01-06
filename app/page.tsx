import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

async function getCourses() {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      include: {
        category: true,
        country: true,
        _count: {
          select: { lessons: true },
        },
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    });
    
    // Log for debugging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Home Page] Found ${courses.length} published courses`);
    }
    
    return courses;
  } catch (error: any) {
    // Better error logging
    console.error("Error fetching courses:", error);
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    });
    return [];
  }
}

export default async function Home() {
  const courses = await getCourses();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Academy LMS
          </h1>
          <p className="text-xl text-gray-600">
            Discover courses tailored to your country and interests
          </p>
        </div>

        <div className="mb-8">
          <Link
            href="/courses"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
          >
            Browse All Courses
          </Link>
        </div>

        {courses.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Featured Courses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  {course.thumbnail && (
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Course Image</span>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-primary-600 font-medium">
                        {course.category?.name || 'Uncategorized'}
                      </span>
                      {course.country && (
                        <span className="text-xs text-gray-500">
                          {course.country.name}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description || "No description available"}
                    </p>
                    <div className="text-sm text-gray-500">
                      {course._count.lessons} lessons
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No courses available yet.</p>
            <p className="text-sm text-gray-500">
              Courses will appear here once they are published.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
