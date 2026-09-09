'use client';

import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Imtihon davom etayotgan vaqtda footer yashiriladi
  if (pathname?.startsWith('/test/') && !pathname?.includes('/results')) {
    return null;
  }

  return (
    <footer className="bg-gray-100 py-6 mt-auto border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-xs">
        <p>&copy; {new Date().getFullYear()} IELTS Mock Test Platform &bull; Rasmiy Cambridge IELTS Mezonlari &bull; Barcha huquqlar himoyalangan.</p>
      </div>
    </footer>
  );
}
