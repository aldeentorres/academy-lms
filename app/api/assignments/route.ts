import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { lessonId, courseId, title, description, dueDate, maxPoints, order, slug } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
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

    // Check if assignment with same slug already exists in this course
    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        courseId: finalCourseId,
        slug: finalSlug,
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'An assignment with this slug already exists in this course' },
        { status: 400 }
      );
    }

    // Check if assignment already exists for this lesson (if lessonId provided)
    if (lessonId) {
      const lessonAssignment = await prisma.assignment.findUnique({
        where: { lessonId },
      });

      if (lessonAssignment) {
        return NextResponse.json(
          { error: 'Assignment already exists for this lesson. Use PUT to update.' },
          { status: 400 }
        );
      }
    }

    const assignment = await prisma.assignment.create({
      data: {
        courseId: finalCourseId,
        lessonId: lessonId || null,
        title,
        slug: finalSlug,
        description,
        order: order || 0,
        dueDate: dueDate ? new Date(dueDate) : null,
        maxPoints: maxPoints || 100,
        isPublished: true,
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
