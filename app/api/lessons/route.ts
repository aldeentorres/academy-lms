import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};
    if (courseId) where.courseId = courseId;
    
    // Add search functionality
    if (search) {
      // SQLite doesn't support mode: 'insensitive', so we use contains
      // For PostgreSQL, you can add mode: 'insensitive'
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const lessons = await prisma.lesson.findMany({
      where,
      include: {
        course: {
          include: {
            category: true,
            country: true,
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
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ lessons });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId, title, slug, description, videoUrl, content, order, isPublished } = body;

    // Check if slug already exists in this course
    const existingLesson = await prisma.lesson.findUnique({
      where: {
        courseId_slug: {
          courseId,
          slug,
        },
      },
    });

    if (existingLesson) {
      return NextResponse.json(
        { error: 'A lesson with this slug already exists in this course' },
        { status: 400 }
      );
    }

    const lesson = await prisma.lesson.create({
      data: {
        courseId,
        title,
        slug,
        description,
        videoUrl,
        content,
        order: order || 0,
        isPublished: isPublished ?? true,
      },
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    );
  }
}
