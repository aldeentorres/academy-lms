import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { lessonId, title, questions } = body;

    if (!lessonId || !title || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'Lesson ID, title, and at least one question are required' },
        { status: 400 }
      );
    }

    // Check if quiz already exists for this lesson
    const existingQuiz = await prisma.quiz.findUnique({
      where: { lessonId },
    });

    if (existingQuiz) {
      return NextResponse.json(
        { error: 'Quiz already exists for this lesson. Use PUT to update.' },
        { status: 400 }
      );
    }

    // Create quiz with questions
    const quiz = await prisma.quiz.create({
      data: {
        lessonId,
        title,
        questions: {
          create: questions.map((q: any) => ({
            question: q.question,
            type: q.type,
            options: q.options,
            correctAnswer: q.correctAnswer,
            points: q.points || 1,
            order: q.order || 0,
          })),
        },
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
