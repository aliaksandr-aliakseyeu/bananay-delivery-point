'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

function stripBackArrow(text: React.ReactNode): string {
  const s = typeof text === 'string' ? text : String(text ?? '');
  return s.replace(/^\s*←\s*/, '').trim();
}

export function BackButton({ href, children, className }: BackButtonProps) {
  const locale = useLocale();
  const path = href.startsWith('/') ? `/${locale}${href}` : `/${locale}/${href}`;
  const label = stripBackArrow(children);
  return (
    <Link href={path} className={cn(className)}>
      <Button
        variant="outline"
        size="sm"
        className="min-w-0 bg-white border border-gray-200 text-gray-900 shadow-sm rounded-lg hover:bg-gray-50 hover:border-gray-300 focus-visible:ring-gray-400"
      >
        <svg
          className="mr-2 h-5 w-5 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {label}
      </Button>
    </Link>
  );
}
