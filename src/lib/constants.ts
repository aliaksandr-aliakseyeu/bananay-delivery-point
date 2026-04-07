export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://bananay-calc.ambitiousforest-deb74a1a.westus.azurecontainerapps.io';

export const DEFAULT_REGION_ID = Number(process.env.NEXT_PUBLIC_DEFAULT_REGION_ID || 1);

export const GEOCODING = {
  DEFAULT_COUNTRY: 'ru' as const,
  DEBOUNCE_MS: 600,
  MIN_SEARCH_LENGTH: 3,
} as const;
