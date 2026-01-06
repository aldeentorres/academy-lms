'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SessionProvider } from './SessionProvider';

export function Navigation() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  if (isDashboard) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors">
              IQI Academy
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/courses" className="text-gray-700 hover:text-gray-900">
              Courses
            </Link>
            <Link href="/agents" className="text-gray-700 hover:text-gray-900">
              Leaderboard
            </Link>
            <SessionProvider />
          </div>
        </div>
      </div>
    </nav>
  );
}
