'use client';

import { useEffect, useState } from 'react';
import { courierApi } from '@/lib/api/courier';

// In-memory cache: mediaId → data URL (persists within page session)
const memCache = new Map<string, string>();
// In-flight dedup: mediaId → Promise<string | null>
const inFlight = new Map<string, Promise<string | null>>();

const SESSION_PREFIX = 'cmedia:';

function getToken(): string | null {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('courier-auth-storage') : null;
    if (!raw) return null;
    const { state } = JSON.parse(raw);
    return state?.token ?? null;
  } catch {
    return null;
  }
}

function loadFromSession(mediaId: string): string | null {
  try {
    return sessionStorage.getItem(SESSION_PREFIX + mediaId);
  } catch {
    return null;
  }
}

function saveToSession(mediaId: string, dataUrl: string): void {
  try {
    sessionStorage.setItem(SESSION_PREFIX + mediaId, dataUrl);
  } catch {
    // sessionStorage quota exceeded — ignore
  }
}

function fetchMedia(mediaId: string): Promise<string | null> {
  const existing = inFlight.get(mediaId);
  if (existing) return existing;

  const token = getToken();
  const url = courierApi.getMediaUrl(mediaId);
  const promise = fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
    .then((r) => (r.ok ? r.blob() : null))
    .then((blob) => {
      if (!blob) return null;
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          memCache.set(mediaId, dataUrl);
          saveToSession(mediaId, dataUrl);
          resolve(dataUrl);
        };
        reader.readAsDataURL(blob);
      });
    })
    .catch(() => null)
    .finally(() => inFlight.delete(mediaId));

  inFlight.set(mediaId, promise);
  return promise;
}

export function CourierMediaImage({
  mediaId,
  alt = '',
  className,
  ...props
}: { mediaId: string; alt?: string } & React.ComponentProps<'img'>) {
  const [src, setSrc] = useState<string | null>(() => {
    if (!mediaId) return null;
    return memCache.get(mediaId) ?? loadFromSession(mediaId) ?? null;
  });

  useEffect(() => {
    if (!mediaId) return;
    // Warm the memCache from sessionStorage if needed
    if (!memCache.has(mediaId)) {
      const cached = loadFromSession(mediaId);
      if (cached) {
        memCache.set(mediaId, cached);
        setSrc(cached);
        return;
      }
    } else {
      setSrc(memCache.get(mediaId)!);
      return;
    }
    let cancelled = false;
    fetchMedia(mediaId).then((url) => {
      if (!cancelled && url) setSrc(url);
    });
    return () => { cancelled = true; };
  }, [mediaId]);

  if (!src) return null;
  return <img src={src} alt={alt} className={className} {...props} />;
}
