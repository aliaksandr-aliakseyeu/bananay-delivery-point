'use client';

import { useGuestRedirectStatus } from './use-guest-redirect-status';

export function RedirectWhenAuthenticated({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useGuestRedirectStatus();

  if (isLoading) return null;
  if (isAuthenticated) return null;
  return <>{children}</>;
}
