'use client';

import { RequireCourierAuth } from './require-courier-auth';

export function RequirePointAuth({ children }: { children: React.ReactNode }) {
  return <RequireCourierAuth>{children}</RequireCourierAuth>;
}
