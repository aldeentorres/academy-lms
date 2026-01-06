import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Link from 'next/link';

async function getCourse(slug: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { slug },
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
            description: true,
            order: true,
            videoUrl: true,
            quiz: {
              select: {
                id: true,
                questions: {
                  select: {
                    id: true,
                  },
                },
              },
            },
            assignment: {
              select: {
                id: true,
              },
            },
          },
        },
        quizzes: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            order: true,
            questions: {
              select: {
                id: true,
              },
            },
          },
            },
        assignments: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            order: true,
            dueDate: true,
            maxPoints: true,
          },
        },
      },
    });
    return course;
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course || !course.isPublished) {
    notFound();
  }

  const session = await getSession();
  const isLoggedIn = !!session?.user;
  const canAccessLessons = session?.user?.role === 'admin' || session?.user?.role === 'agent';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Course Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Course Image */}
            {course.thumbnail ? (
              <div className="w-full md:w-1/3">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-64 object-cover rounded-xl shadow-md"
                />
              </div>
            ) : (
              <div className="w-full md:w-1/3 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-32 h-32 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            )}

            {/* Course Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                {course.category.name}
              </span>
              {course.country && (
                  <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {course.country.name}
                </span>
                )}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">{course.title}</h1>
              {course.description && (
                <p className="text-lg text-gray-700 leading-relaxed mb-6">{course.description}</p>
              )}

              {/* Login Prompt (if not logged in) */}
              {!canAccessLessons && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-yellow-800 mb-2">
                    🔒 Login Required to Access Lessons
                  </p>
                  <p className="text-sm text-yellow-700 mb-3">
                    Please log in as an admin or agent to access the course lessons.
                  </p>
                  <Link
                    href="/login"
                    className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition"
                  >
                    Login to Continue
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Course Content List - Lessons, Quizzes, Assignments in sequence */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Course Content ({course.lessons.length + course.quizzes.length + course.assignments.length})
                    </h2>

          {(() => {
            // Combine all items and sort by order
            const allItems = [
              ...course.lessons.map(l => ({ ...l, type: 'lesson' as const })),
              ...course.quizzes.map(q => ({ ...q, type: 'quiz' as const })),
              ...course.assignments.map(a => ({ ...a, type: 'assignment' as const })),
            ].sort((a, b) => a.order - b.order);

            if (allItems.length === 0) {
              return (
                <div className="text-center py-12">
                  <p className="text-gray-600">No content available yet.</p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {allItems.map((item, index) => {
                  const isLesson = item.type === 'lesson';
                  const isQuiz = item.type === 'quiz';
                  const isAssignment = item.type === 'assignment';

                  return (
                    <div
                      key={item.id}
                      className="border-2 border-gray-200 rounded-xl p-6 transition-all bg-white hover:border-gray-300 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white ${
                              isLesson ? 'bg-primary-500' : isQuiz ? 'bg-purple-500' : 'bg-orange-500'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-1 text-xs font-semibold rounded ${
                                  isLesson ? 'bg-primary-100 text-primary-700' : 
                                  isQuiz ? 'bg-purple-100 text-purple-700' : 
                                  'bg-orange-100 text-orange-700'
                                }`}>
                                  {isLesson ? 'Lesson' : isQuiz ? 'Quiz' : 'Assignment'}
                                </span>
                                <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                  </div>
                              {item.description && (
                                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-sm">
                                {isLesson && (item as any).videoUrl && (
                                  <span className="flex items-center text-gray-600">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                    </svg>
                                    Video
                                  </span>
                )}
                                {isQuiz && (item as any).questions && (item as any).questions.length > 0 && (
                                  <span className="flex items-center text-gray-600">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                    </svg>
                                    {(item as any).questions.length} Questions
                                  </span>
                                )}
                                {isAssignment && (item as any).dueDate && (
                                  <span className="flex items-center text-gray-600">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    Due: {new Date((item as any).dueDate).toLocaleDateString()}
                                  </span>
                                )}
                                {isAssignment && (item as any).maxPoints && (
                                  <span className="flex items-center text-gray-600">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    {(item as any).maxPoints} Points
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          {canAccessLessons ? (
                            <Link
                              href={
                                isLesson
                                  ? `/courses/${course.slug}/lessons/${item.slug}`
                                  : isQuiz
                                  ? `/courses/${course.slug}/quizzes/${item.slug}`
                                  : `/courses/${course.slug}/assignments/${item.slug}`
                              }
                              className="px-6 py-3 rounded-lg font-semibold transition shadow-md hover:shadow-lg bg-primary-600 text-white hover:bg-primary-700"
                            >
                              View {isLesson ? 'Lesson' : isQuiz ? 'Quiz' : 'Assignment'}
                            </Link>
                          ) : (
                            <div className="px-6 py-3 rounded-lg font-semibold bg-gray-300 text-gray-600 cursor-not-allowed">
                              Login Required
                  </div>
                )}
                        </div>
                      </div>
                  </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
