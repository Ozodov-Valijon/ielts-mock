'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth';

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const pathname = usePathname();

  // Imtihon davom etayotgan bo'lsa (faqat results bo'lmaganda), yuqori Navbar yashiriladi
  if (pathname?.startsWith('/test/') && !pathname?.includes('/results')) {
    return null;
  }

  return (
    <nav className="bg-blue-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              IELTS Mock
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="hover:bg-blue-700 px-3 py-2 rounded-md">
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="hover:bg-blue-700 px-3 py-2 rounded-md">
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 px-3.5 py-2 rounded-lg text-sm font-semibold transition cursor-pointer"
                >
                  Chiqish
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:bg-blue-700 px-3.5 py-2 rounded-lg text-sm font-semibold">
                  Kirish
                </Link>
                <Link
                  href="/register"
                  className="bg-white text-blue-800 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-bold transition"
                >
                  Ro&apos;yxatdan o&apos;tish
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
