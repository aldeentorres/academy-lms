import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = token?.role === 'admin';
    const isAgent = token?.role === 'agent';
    const isDashboardRoute = req.nextUrl.pathname.startsWith('/dashboard');
    const isLessonRoute = req.nextUrl.pathname.includes('/lessons/');
    const isQuizRoute = req.nextUrl.pathname.includes('/quizzes/');
    const isAssignmentRoute = req.nextUrl.pathname.includes('/assignments/');

    // Protect dashboard routes - only admins allowed
    if (isDashboardRoute && !isAdmin) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url));
    }

    // Protect lesson/quiz/assignment routes - require login (admin or agent)
    if ((isLessonRoute || isQuizRoute || isAssignmentRoute) && !isAdmin && !isAgent) {
      const courseSlug = req.nextUrl.pathname.split('/courses/')[1]?.split('/')[0];
      return NextResponse.redirect(new URL(`/courses/${courseSlug}?error=login_required`, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        const publicRoutes = ['/', '/courses', '/login'];
        const isPublicRoute = publicRoutes.some(route => 
          req.nextUrl.pathname === route || 
          (req.nextUrl.pathname.startsWith('/courses/') && 
           !req.nextUrl.pathname.includes('/lessons/') &&
           !req.nextUrl.pathname.includes('/quizzes/') &&
           !req.nextUrl.pathname.includes('/assignments/'))
        );
        
        if (isPublicRoute) {
          return true;
        }

        // Dashboard requires admin
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return token?.role === 'admin';
        }

        // Lesson/Quiz/Assignment routes require login (admin or agent)
        if (req.nextUrl.pathname.includes('/lessons/') || 
            req.nextUrl.pathname.includes('/quizzes/') || 
            req.nextUrl.pathname.includes('/assignments/')) {
          return token?.role === 'admin' || token?.role === 'agent';
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/courses/:path*/lessons/:path*',
    '/courses/:path*/quizzes/:path*',
    '/courses/:path*/assignments/:path*'
  ],
};
