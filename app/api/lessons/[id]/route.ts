import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id },
      include: {
        course: true,
        quiz: {
          include: {
            questions: true,
          },
        },
        assignment: true,
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(lesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lesson' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, slug, description, videoUrl, content, order, isPublished } = body;

    const existingLesson = await prisma.lesson.findUnique({
      where: { id: params.id },
    });

    if (!existingLesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Check slug conflict if changed
    if (slug !== existingLesson.slug) {
      const slugConflict = await prisma.lesson.findUnique({
        where: {
          courseId_slug: {
            courseId: existingLesson.courseId,
            slug,
          },
        },
      });

      if (slugConflict) {
        return NextResponse.json(
          { error: 'A lesson with this slug already exists in this course' },
          { status: 400 }
        );
      }
    }

    const lesson = await prisma.lesson.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        description,
        videoUrl,
        content,
        order: order !== undefined ? order : existingLesson.order,
        isPublished: isPublished !== undefined ? isPublished : existingLesson.isPublished,
      },
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.error('Error updating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to update lesson' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.lesson.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json(
      { error: 'Failed to delete lesson' },
      { status: 500 }
    );
  }
}
