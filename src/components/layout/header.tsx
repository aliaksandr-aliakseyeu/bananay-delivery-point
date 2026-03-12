'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LanguageSwitcher } from './language-switcher';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { APP_NAME } from '@/lib/site-config';
import { useAuthStore } from '@/lib/stores/auth-store';
import { LogOut, Menu, X } from 'lucide-react';

export function Header() {
  const t = useTranslations('Header');
  const router = useRouter();
  const { isAuthenticated, phone, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-[9999] w-full border-b bg-background/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-1 shrink-0">
          <Image
            src="/bananay-logo-transparent.png"
            alt="Bananay"
            width={240}
            height={72}
            className="h-8 w-auto object-contain object-center"
            priority
            unoptimized
          />
          <span className="text-base italic font-medium text-[#3a9cf5] opacity-90 mt-[3px]">{APP_NAME}</span>
        </Link>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600 truncate max-w-[140px]">{phone}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="font-semibold text-[var(--muted)] hover:text-red-600 hover:bg-red-50"
              >
                <span className="inline-flex items-center gap-1">
                  <LogOut className="h-4 w-4" />
                  {t('logout')}
                </span>
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => router.push('/login')}
              className="font-semibold bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
            >
              {t('signIn')}
            </Button>
          )}
          <LanguageSwitcher />
        </div>

        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMobileMenuOpen((o) => !o)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <div className="px-4 py-4 space-y-4">
            {isAuthenticated ? (
              <>
                <div className="text-sm font-medium text-gray-700 truncate">{phone}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  className="w-full justify-start text-red-600 hover:bg-red-50"
                >
                  <span className="inline-flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    {t('logout')}
                  </span>
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => { setIsMobileMenuOpen(false); router.push('/login'); }}
                className="w-full font-semibold bg-[var(--primary)] text-white"
              >
                {t('signIn')}
              </Button>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </header>
  );
}

