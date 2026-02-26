import { useState, useEffect, useRef } from "react";
import { getAuthToken } from "../store/useAuthStore";

export function isApiMediaPath(url: string): boolean {
  return url.startsWith("/api/") && url.includes("/media/");
}

/**
 * For API media paths (/api/.../media/...), fetches with auth and returns a blob URL
 * so that <img>/<video> can display without triggering a 401.
 * For blob/data/external URLs, returns as-is.
 */
export function useAuthenticatedMediaUrl(url: string | undefined): string | undefined {
  const [displayUrl, setDisplayUrl] = useState<string | undefined>(undefined);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!url) {
      setDisplayUrl(undefined);
      blobUrlRef.current = null;
      return;
    }
    if (!isApiMediaPath(url)) {
      setDisplayUrl(url);
      blobUrlRef.current = null;
      return;
    }
    let cancelled = false;
    const token = getAuthToken();
    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load media");
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        const blobUrl = URL.createObjectURL(blob);
        blobUrlRef.current = blobUrl;
        setDisplayUrl(blobUrl);
      })
      .catch(() => {
        if (!cancelled) setDisplayUrl(undefined);
      });
    return () => {
      cancelled = true;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [url]);

  if (!url) return undefined;
  if (!isApiMediaPath(url)) return url;
  return displayUrl;
}
