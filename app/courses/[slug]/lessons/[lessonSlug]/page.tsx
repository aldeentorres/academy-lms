import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import VideoPlayer from '@/components/VideoPlayer';
import Quiz from '@/components/Quiz';
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
      },
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return null;
  }
}

async function getLesson(courseSlug: string, lessonSlug: string) {
  try {
    const lesson = await prisma.lesson.findFirst({
      where: {
        slug: lessonSlug,
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
          },
        },
        quiz: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
          },
        },
        assignment: true,
      },
    });
    return lesson;
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return null;
  }
}


export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const { slug, lessonSlug } = await params;
  // Check authentication - middleware will handle redirect, but we check here too
  const session = await getSession();
  const canAccess = session?.user?.role === 'admin' || session?.user?.role === 'agent';
  
  if (!canAccess) {
    redirect(`/login?callbackUrl=/courses/${slug}/lessons/${lessonSlug}`);
  }

  const lesson = await getLesson(slug, lessonSlug);

  if (!lesson || !lesson.course) {
    notFound();
  }

  const course = lesson.course;

  // Find current lesson index and navigation
  const currentIndex = course.lessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? course.lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null;

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
            <span className="text-gray-900 font-medium">Lesson {currentIndex + 1}</span>
          </nav>
        </div>

        {/* Lesson Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-3">
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
                Lesson {currentIndex + 1}: {lesson.title}
              </h1>
              <p className="text-sm text-gray-600">
                {course.title} • Lesson {currentIndex + 1} of {course.lessons.length}
              </p>
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 mb-8">
          {/* Video */}
          <div className="mb-8">
            <VideoPlayer videoUrl={lesson.videoUrl || null} title={lesson.title} />
          </div>

          {/* Content */}
          {lesson.content && (
            <div
              className="mb-8 prose prose-lg max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          )}

          {/* Quiz */}
          {lesson.quiz && lesson.quiz.questions.length > 0 && (
            <div className="mb-8">
              <Quiz
                quizId={lesson.quiz.id}
                questions={lesson.quiz.questions.map((q) => ({
                  id: q.id,
                  question: q.question,
                  type: q.type,
                  options: q.options ? JSON.parse(q.options) : undefined,
                  correctAnswer: q.correctAnswer,
                  points: q.points,
                }))}
                title={lesson.quiz.title}
              />
            </div>
          )}

          {/* Assignment */}
          {lesson.assignment && (
            <div>
              <Assignment
                assignmentId={lesson.assignment.id}
                title={lesson.assignment.title}
                description={lesson.assignment.description}
                dueDate={lesson.assignment.dueDate || undefined}
                maxPoints={lesson.assignment.maxPoints}
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {prevLesson ? (
            <Link
              href={`/courses/${course.slug}/lessons/${prevLesson.slug}`}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous Lesson
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

          {nextLesson ? (
            <Link
              href={`/courses/${course.slug}/lessons/${nextLesson.slug}`}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition flex items-center"
            >
              Next Lesson
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
