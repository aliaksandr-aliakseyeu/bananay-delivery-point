import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'ru'],
  defaultLocale: 'ru',
  pathnames: {
    '/': '/',
    '/login': '/login',
    '/privacy-policy': '/privacy-policy',
    '/user-agreement': '/user-agreement',
    '/dashboard': '/dashboard',
    '/dashboard/daily-checkin': '/dashboard/daily-checkin',
    '/dashboard/profile': '/dashboard/profile',
    '/dashboard/vehicles': '/dashboard/vehicles',
    '/dashboard/documents': '/dashboard/documents',
    '/dashboard/delivery-tasks': '/dashboard/delivery-tasks',
    '/dashboard/delivery-tasks/history': '/dashboard/delivery-tasks/history',
    '/dashboard/points-management': '/dashboard/points-management',
    '/onboarding': '/onboarding',
  },
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
