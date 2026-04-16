'use client';

import { MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function WhatsAppButton() {
  const pathname = usePathname();

  if (pathname === '/' || pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <a
      href="https://wa.me/1234567890"
      target="_blank"
      rel="noopener noreferrer"
      title="Chat with us on WhatsApp"
      className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center z-40"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}
