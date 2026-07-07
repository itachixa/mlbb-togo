'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { useThemeStore } from '@/store/useStore';
import ParticlesBackground from './ParticlesBackground';

export default function Providers({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s: any) => s.theme);
  const themeVariant = useThemeStore((s: any) => s.themeVariant);
  const brightness = useThemeStore((s: any) => s.brightness);
  const pathname = usePathname();
  const isPublic = pathname === '/' || pathname.startsWith('/admin-login');
  const dark = isPublic ? true : theme === 'dark';

  useEffect(() => {
    const html = document.documentElement;
    if (dark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    html.classList.remove('theme-default', 'theme-esports-gold', 'theme-night');
    html.classList.add(`theme-${themeVariant}`);
    if (themeVariant === 'night') {
      html.style.setProperty('--brightness', String(brightness));
    } else {
      html.style.removeProperty('--brightness');
    }
  }, [dark, themeVariant, brightness]);

  return (
    <>
      {isPublic && <ParticlesBackground />}
      <Toaster
        position="top-right"
        gutter={12}
        toastOptions={{
          duration: 3500,
          style: {
            background: dark ? 'rgba(15, 15, 42, 0.92)' : 'rgba(255,255,255,0.95)',
            color: dark ? '#e2e8f0' : '#0f172a',
            border: `1px solid ${dark ? 'rgba(30, 30, 63, 0.8)' : '#e2e8f0'}`,
            borderRadius: '14px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
            backdropFilter: 'blur(8px)',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: dark ? '#0a0a1a' : '#ffffff' },
            style: { borderColor: 'rgba(34,197,94,0.4)' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: dark ? '#0a0a1a' : '#ffffff' },
            style: { borderColor: 'rgba(239,68,68,0.4)' },
          },
        }}
      />
      {children}
    </>
  );
}
