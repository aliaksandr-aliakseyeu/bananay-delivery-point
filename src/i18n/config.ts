export const locales = ['en', 'ka', 'ru'] as const;
export type Locale = (typeof locales)[number];

export const visibleLocales = ['en', 'ka'] as const;
export type VisibleLocale = (typeof visibleLocales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'EN',
  ka: 'KA',
  ru: 'RU',
};
