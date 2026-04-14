'use client';

import { Link } from '@/i18n/routing';

type AuthPageShellProps = {
  eyebrow: string;
  title: string;
  heading: string;
  description: string;
  backLabel: string;
  children: React.ReactNode;
};

export function AuthPageShell({
  eyebrow,
  title,
  heading,
  description,
  backLabel,
  children,
}: AuthPageShellProps) {
  return (
    <div className="flex min-h-full items-center justify-center bg-gray-50 py-12">
      <div className="mx-4 w-full max-w-xl rounded-xl p-6 sm:p-8">
        <div className="mb-8 text-center">
          <p className="mb-2 text-[14px] font-semibold uppercase tracking-[0.28em] text-slate-400">
            {eyebrow}
          </p>
          <h1 className="text-4xl font-bold leading-[0.95] text-primary">
            {title}
          </h1>
        </div>

        <div>
          <h2 className="mb-1 text-xl font-semibold text-gray-900">{heading}</h2>
          <p className="mb-6 text-[15px] text-gray-600">{description}</p>
          {children}
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-[15px] text-gray-600 hover:text-gray-900">
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
