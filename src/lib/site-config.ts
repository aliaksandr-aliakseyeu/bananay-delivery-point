/**
 * Название приложения для шапки и title.
 */
export const APP_NAME = 'Delivery Point';

export const SITE_TITLE = `Bananay ${APP_NAME}`;

export const MAIN_SITE_URL = 'https://bananay.pro';

function resolvePublicAppUrl(
  nextPublicValue: string | undefined,
  fallback: string
): string {
  const raw = nextPublicValue?.trim();
  if (!raw) return fallback;
  if (raw.includes('://')) return raw;
  return `http://${raw}`;
}

/** Must use NEXT_PUBLIC_* — read in client components (footer) during SSR hydration. */
export const APP_PRODUCER_URL = resolvePublicAppUrl(
  process.env.NEXT_PUBLIC_APP_PRODUCER_URL,
  `${MAIN_SITE_URL}#producer`
);
export const APP_TRUCK_URL = resolvePublicAppUrl(
  process.env.NEXT_PUBLIC_APP_TRUCK_URL,
  `${MAIN_SITE_URL}#drivers`
);
export const APP_HUB_URL = resolvePublicAppUrl(
  process.env.NEXT_PUBLIC_APP_HUB_URL,
  `${MAIN_SITE_URL}#distribution`
);
export const APP_COURIER_URL = resolvePublicAppUrl(
  process.env.NEXT_PUBLIC_APP_COURIER_URL,
  `${MAIN_SITE_URL}#courier`
);

export type RoleFooterLink = {
  translationKey: 'producer' | 'drivers' | 'distribution' | 'courier';
  href: string;
};

export type RoleFooterConfig = {
  roleLabel: string;
  homeHref: string;
  contactEmail: string;
  contactPhoneHref: string;
  contactPhoneLabel: string;
  otherRoles: RoleFooterLink[];
};

function localizeAppUrl(href: string, locale: string) {
  const normalizedLocale = locale === 'ka' ? 'ka' : 'en';

  if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
    return href;
  }

  try {
    const url = new URL(href);
    const pathnameWithoutLocale = url.pathname.replace(/\/(en|ka|ru)\/?$/, '');
    const normalizedPath = pathnameWithoutLocale === '/' ? '' : pathnameWithoutLocale.replace(/\/$/, '');
    url.pathname = `${normalizedPath}/${normalizedLocale}`;
    return url.toString();
  } catch {
    const normalizedHref = href.replace(/\/(en|ka|ru)\/?$/, '').replace(/\/$/, '');
    return `${normalizedHref}/${normalizedLocale}`;
  }
}

export function getRoleFooterConfig(locale: string): RoleFooterConfig {
  return {
    roleLabel: APP_NAME,
    homeHref: localizeAppUrl(MAIN_SITE_URL, locale),
    contactEmail: 'hello@bananay.pro',
    contactPhoneHref: 'tel:+79183842676',
    contactPhoneLabel: '+7 918 384 2676',
    otherRoles: [
      { translationKey: 'producer', href: localizeAppUrl(APP_PRODUCER_URL, locale) },
      { translationKey: 'drivers', href: localizeAppUrl(APP_TRUCK_URL, locale) },
      { translationKey: 'distribution', href: localizeAppUrl(APP_HUB_URL, locale) },
      { translationKey: 'courier', href: localizeAppUrl(APP_COURIER_URL, locale) },
    ],
  };
}
