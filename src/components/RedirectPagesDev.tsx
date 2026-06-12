'use client';
import { useEffect } from 'react';

export default function RedirectPagesDev() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Only redirect from preview URLs (subdomains) to the main domain
      if (
        window.location.hostname.endsWith('.watanare-reader.pages.dev') &&
        window.location.hostname !== 'watanare-reader.pages.dev'
      ) {
        window.location.replace(
          `https://watanare-reader.pages.dev${window.location.pathname}${window.location.search}`
        );
      }
    }
  }, []);

  return null;
}
