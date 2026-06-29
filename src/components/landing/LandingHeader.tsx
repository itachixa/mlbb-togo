'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, ChevronDown, Menu, X, Home, Check,
  LayoutGrid, Trophy, Sparkles, Handshake, Mail,
} from 'lucide-react';
import { useLangStore } from '@/store/useStore';
import { useT } from '@/lib/i18n';

const LANGS = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
];

const SECTIONS = [
  { key: 'nav.home', id: '', icon: Home },
  { key: 'nav.features', id: 'features', icon: LayoutGrid },
  { key: 'nav.mtl', id: 'mtl', icon: Trophy },
  { key: 'nav.heroes', id: 'heroes', icon: Sparkles },
  { key: 'nav.partners', id: 'partners', icon: Handshake },
  { key: 'nav.contact', id: 'contact', icon: Mail },
];

export default function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const lang = useLangStore((s: any) => s.lang);
  const setLang = useLangStore((s: any) => s.setLang);
  const t = useT();

  // Applique la langue persistée après le montage (évite tout décalage d'hydratation).
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('mlbb-lang') : null;
    if (saved && saved !== lang) setLang(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Défilement fluide vers une section de la page (ou le haut si id vide).
  const goTo = (id: string) => {
    setMenuOpen(false);
    if (!id) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className="absolute top-0 inset-x-0 z-30 h-20 bg-gradient-to-b from-black/70 via-black/30 to-transparent">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mlbb-togo-logo.png" alt="MLBB Togo" className="h-9 md:h-10 w-auto" />
        </Link>

        {/* Droite */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Sélecteur de langue */}
          <div className="relative">
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors"
              aria-label="Langue"
            >
              <Globe size={18} />
              <span className="text-sm font-medium uppercase">{lang}</span>
              <ChevronDown size={14} />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  className="absolute right-0 top-10 w-32 rounded-xl border border-gaming-border bg-gaming-card shadow-gaming overflow-hidden"
                >
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code);
                        setLangOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                        lang === l.code
                          ? 'text-neon-blue bg-neon-blue/10'
                          : 'text-gray-300 hover:bg-gaming-surface hover:text-white'
                      }`}
                    >
                      {l.label}
                      {lang === l.code && <Check size={14} />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Login */}
          <Link
            href="/login"
            className="px-6 py-1.5 rounded-md text-white text-sm font-semibold border border-white/20 shadow-md transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(180deg, #4aa6ff 0%, #1e6fd0 100%)' }}
          >
            {t('header.login')}
          </Link>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  className="absolute right-0 top-12 w-56 rounded-xl border border-gaming-border bg-gaming-card shadow-gaming overflow-hidden py-1"
                >
                  {/* Sections de la page */}
                  {SECTIONS.map((s) => {
                    const Icon = s.icon;
                    return (
                      <button
                        key={s.key}
                        onClick={() => goTo(s.id)}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-gaming-surface hover:text-white transition-colors text-left"
                      >
                        <Icon size={16} /> {t(s.key)}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
