import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Assignment from '@/components/Assignment';
import Link from 'next/link';

async function getCourse(slug: string) {
  try {
    return await prisma.course.findUnique({
      where: { slug },
      include: {
        lessons: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            slug: true,
            order: true,
          },
        },
        quizzes: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            slug: true,
            order: true,
          },
        },
        assignments: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            slug: true,
            order: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
}

async function getAssignment(courseSlug: string, assignmentSlug: string) {
  try {
    const assignment = await prisma.assignment.findFirst({
      where: {
        slug: assignmentSlug,
        course: { slug: courseSlug },
        isPublished: true,
      },
      include: {
        course: {
          include: {
            category: true,
            country: true,
            lessons: {
              where: { isPublished: true },
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                slug: true,
                order: true,
              },
            },
            quizzes: {
              where: { isPublished: true },
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                slug: true,
                order: true,
              },
            },
            assignments: {
              where: { isPublished: true },
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                slug: true,
                order: true,
              },
            },
          },
        },
      },
    });
    return assignment;
  } catch (error) {
    console.error('Error fetching assignment:', error);
    return null;
  }
}

export default async function AssignmentPage({
  params,
}: {
  params: Promise<{ slug: string; assignmentSlug: string }>;
}) {
  const { slug, assignmentSlug } = await params;
  const session = await getSession();
  const canAccess = session?.user?.role === 'admin' || session?.user?.role === 'agent';
  
  if (!canAccess) {
    redirect(`/login?callbackUrl=/courses/${slug}/assignments/${assignmentSlug}`);
  }

  const assignment = await getAssignment(slug, assignmentSlug);

  if (!assignment || !assignment.course) {
    notFound();
  }

  const course = assignment.course;

  // Create a combined sequence of all items (lessons, quizzes, assignments) sorted by order
  const allItems = [
    ...course.lessons.map(l => ({ ...l, type: 'lesson' as const })),
    ...course.quizzes.map(q => ({ ...q, type: 'quiz' as const })),
    ...course.assignments.map(a => ({ ...a, type: 'assignment' as const })),
  ].sort((a, b) => a.order - b.order);

  const currentIndex = allItems.findIndex((item) => item.id === assignment.id && item.type === 'assignment');
  const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null;
  const nextItem = currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/courses" className="hover:text-primary-600">
              Courses
            </Link>
            <span>/</span>
            <Link href={`/courses/${course.slug}`} className="hover:text-primary-600">
              {course.title}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Assignment</span>
          </nav>
        </div>

        {/* Assignment Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                  Assignment
                </span>
                <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                  {course.category.name}
                </span>
                {course.country && (
                  <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    {course.country.name}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {assignment.title}
              </h1>
              {assignment.dueDate && (
                <p className="text-sm text-gray-600 mt-2">
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Assignment Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 mb-8">
          <Assignment
            assignmentId={assignment.id}
            title={assignment.title}
            description={assignment.description}
            dueDate={assignment.dueDate || undefined}
            maxPoints={assignment.maxPoints}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {prevItem ? (
            <Link
              href={
                prevItem.type === 'lesson'
                  ? `/courses/${course.slug}/lessons/${prevItem.slug}`
                  : prevItem.type === 'quiz'
                  ? `/courses/${course.slug}/quizzes/${prevItem.slug}`
                  : `/courses/${course.slug}/assignments/${prevItem.slug}`
              }
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </Link>
          ) : (
            <div></div>
          )}

          <Link
            href={`/courses/${course.slug}`}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Back to Course
          </Link>

          {nextItem ? (
            <Link
              href={
                nextItem.type === 'lesson'
                  ? `/courses/${course.slug}/lessons/${nextItem.slug}`
                  : nextItem.type === 'quiz'
                  ? `/courses/${course.slug}/quizzes/${nextItem.slug}`
                  : `/courses/${course.slug}/assignments/${nextItem.slug}`
              }
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition flex items-center"
            >
              Next
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
}
