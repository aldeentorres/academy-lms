import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all courses
    const allCourses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        isPublished: true,
        categoryId: true,
        countryId: true,
      },
    });

    // Get published courses
    const publishedCourses = await prisma.course.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        slug: true,
        isPublished: true,
        categoryId: true,
        countryId: true,
      },
    });

    // Try the home page query
    let homePageQuery;
    try {
      homePageQuery = await prisma.course.findMany({
        where: { isPublished: true },
        include: {
          category: true,
          country: true,
          _count: {
            select: { lessons: true },
          },
        },
        take: 6,
        orderBy: { createdAt: 'desc' },
      });
    } catch (queryError: any) {
      homePageQuery = { error: queryError.message, code: queryError.code };
    }

    return NextResponse.json({
      summary: {
        totalCourses: allCourses.length,
        publishedCourses: publishedCourses.length,
        unpublishedCourses: allCourses.length - publishedCourses.length,
      },
      allCourses: allCourses,
      publishedCourses: publishedCourses,
      homePageQuery: homePageQuery,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
