import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, description, thumbnail, categoryId, countryId, isPublished } = body;

    // Check if slug already exists
    const existingCourse = await prisma.course.findUnique({
      where: { slug },
    });

    if (existingCourse) {
      return NextResponse.json(
        { error: 'A course with this slug already exists' },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        thumbnail,
        categoryId,
        countryId: countryId || null,
        isPublished: isPublished || false,
      },
      include: {
        category: true,
        country: true,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const categoryId = searchParams.get('categoryId');
    const countryId = searchParams.get('countryId');
    const isPublished = searchParams.get('isPublished');
    const search = searchParams.get('search'); // Search query

    // Build where clause
    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (countryId) where.countryId = countryId;
    if (isPublished !== null) where.isPublished = isPublished === 'true';
    
    // Add search functionality (case-insensitive search in title and description)
    if (search) {
      // SQLite doesn't support mode: 'insensitive', so we use contains
      // For PostgreSQL, you can add mode: 'insensitive'
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.course.count({ where });

    // Get paginated courses
    const courses = await prisma.course.findMany({
      where,
      include: {
        category: true,
        country: true,
        _count: {
          select: { lessons: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    });

    return NextResponse.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
