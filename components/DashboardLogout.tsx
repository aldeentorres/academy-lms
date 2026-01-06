'use client';

import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

export default function DashboardLogout() {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="w-full flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      Logout
    </button>
  );
}
