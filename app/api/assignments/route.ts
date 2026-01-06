import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { lessonId, title, description, dueDate, maxPoints } = body;

    if (!lessonId || !title || !description) {
      return NextResponse.json(
        { error: 'Lesson ID, title, and description are required' },
        { status: 400 }
      );
    }

    // Check if assignment already exists for this lesson
    const existingAssignment = await prisma.assignment.findUnique({
      where: { lessonId },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Assignment already exists for this lesson. Use PUT to update.' },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.create({
      data: {
        lessonId,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        maxPoints: maxPoints || 100,
      },
    });

    return NextResponse.json(assignment);
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}
