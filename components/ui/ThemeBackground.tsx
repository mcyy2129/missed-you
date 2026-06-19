'use client';

import { useEffect } from 'react';
import { useApp } from '@/lib/store';

export default function ThemeBackground() {
  const { themeBackground } = useApp();

  useEffect(() => {
    const bgUrl = themeBackground || '/bg.png';
    document.documentElement.style.setProperty('--theme-bg', `url('${bgUrl}')`);
  }, [themeBackground]);

  return null;
}
