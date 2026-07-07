'use client';

import { useThemeStore } from '@/store/useStore';
import { Swords, Crown } from 'lucide-react';

export default function ThemeSwitcher() {
  const theme = useThemeStore((s: any) => s.theme);
  const toggleTheme = useThemeStore((s: any) => s.toggleTheme);
  const isRoyal = theme === 'royal-gold';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Switch theme"
      className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border hover:scale-105"
      style={{
        background: isRoyal ? 'rgba(212, 168, 67, 0.15)' : 'rgba(0, 212, 255, 0.1)',
        borderColor: isRoyal ? 'rgba(212, 168, 67, 0.3)' : 'rgba(0, 212, 255, 0.3)',
        color: isRoyal ? '#d4a843' : '#00d4ff',
        boxShadow: isRoyal ? '0 0 10px rgba(212, 168, 67, 0.2)' : '0 0 10px rgba(0, 212, 255, 0.2)',
      }}
    >
      <span className="flex items-center gap-1">
        {isRoyal ? <Crown size={14} /> : <Swords size={14} />}
        <span className="hidden sm:inline">{isRoyal ? 'Royal Gold' : 'Dark Esports'}</span>
      </span>
      <span
        className="w-2 h-2 rounded-full transition-all duration-300"
        style={{
          background: isRoyal ? '#d4a843' : '#00d4ff',
          boxShadow: isRoyal ? '0 0 6px rgba(212, 168, 67, 0.6)' : '0 0 6px rgba(0, 212, 255, 0.6)',
        }}
      />
    </button>
  );
}
