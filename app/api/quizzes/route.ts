import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { lessonId, courseId, title, description, questions, order, slug } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Determine courseId - either from body, or from lesson if lessonId provided
    let finalCourseId = courseId;
    if (lessonId && !finalCourseId) {
      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        select: { courseId: true },
      });
      if (!lesson) {
        return NextResponse.json(
          { error: 'Lesson not found' },
          { status: 404 }
        );
      }
      finalCourseId = lesson.courseId;
    }

    if (!finalCourseId) {
      return NextResponse.json(
        { error: 'Course ID is required (either provide courseId or lessonId)' },
        { status: 400 }
      );
    }

    // Generate slug from title if not provided
    const generateSlug = (text: string) => {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    };

    const finalSlug = slug || generateSlug(title);

    // Check if quiz with same slug already exists in this course
    const existingQuiz = await prisma.quiz.findFirst({
      where: {
        courseId: finalCourseId,
        slug: finalSlug,
      },
    });

    if (existingQuiz) {
      return NextResponse.json(
        { error: 'A quiz with this slug already exists in this course' },
        { status: 400 }
      );
    }

    // Check if quiz already exists for this lesson (if lessonId provided)
    if (lessonId) {
      const lessonQuiz = await prisma.quiz.findUnique({
        where: { lessonId },
      });

      if (lessonQuiz) {
        return NextResponse.json(
          { error: 'Quiz already exists for this lesson. Use PUT to update.' },
          { status: 400 }
        );
      }
    }

    // Create quiz with questions
    const quiz = await prisma.quiz.create({
      data: {
        courseId: finalCourseId,
        lessonId: lessonId || null,
        title,
        slug: finalSlug,
        description: description || null,
        order: order || 0,
        isPublished: true,
        questions: questions && questions.length > 0 ? {
          create: questions.map((q: any) => ({
            question: q.question,
            type: q.type,
            options: q.options ? (typeof q.options === 'string' ? q.options : JSON.stringify(q.options)) : null,
            correctAnswer: q.correctAnswer,
            points: q.points || 1,
            order: q.order || 0,
          })),
        } : undefined,
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json(quiz);
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }
    console.error('Error creating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to create quiz' },
      { status: 500 }
    );
  }
}
