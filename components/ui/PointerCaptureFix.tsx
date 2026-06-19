'use client';

import { useEffect } from 'react';

export default function PointerCaptureFix() {
  useEffect(() => {
    const handler = (e: ErrorEvent) => {
      if (
        e.message?.includes('releasePointerCapture') ||
        e.message?.includes('No active pointer')
      ) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };
    window.addEventListener('error', handler, true);
    return () => window.removeEventListener('error', handler, true);
  }, []);

  return null;
}
