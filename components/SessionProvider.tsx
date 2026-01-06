'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export function SessionProvider() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-700">
          {session.user.name} ({session.user.role})
        </span>
        {session.user.role === 'admin' && (
          <Link
            href="/dashboard"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Dashboard
          </Link>
        )}
        {session.user.role === 'agent' && session.user.slug && (
          <Link
            href={`/agent/${session.user.slug}`}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            My Profile
          </Link>
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="text-sm text-gray-700 hover:text-gray-900"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="text-primary-600 hover:text-primary-700 font-medium"
    >
      Login
    </Link>
  );
}
